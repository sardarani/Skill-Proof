export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { skill, keyword, role, resume_text, resume } = req.body;

  if (!skill) {
    return res.status(400).json({ error: 'Skill is required' });
  }

  // The page sends only experience bullets; scrub contact details here too in case an older page or another client sends more.
  const candidateResume = scrubContact(resume_text || resume || '').slice(0, 2500);
  const targetRole = (role && role !== 'auto' && role !== 'Detect from job description') ? role : 'Target Role';
  // ATS systems match the job description's own wording, so that is the phrase the bullet must carry.
  const mustInclude = String(keyword || skill).trim();

  const systemPrompt = `You are an expert ATS resume writer.
Task: Write ONE resume bullet that demonstrates a specific skill the job description asks for.

RULES:
1. KEYWORD: The bullet MUST contain the exact phrase given as "Required keyword", written verbatim. ATS software matches exact words, so do not paraphrase it or swap in a synonym.
2. RELEVANCE: The bullet must be about doing that skill — show the candidate using it — not about a different skill that merely mentions it.
3. LENGTH: No more than 30 words.
4. FORM: Start with a strong past-tense action verb (Led, Built, Designed, Implemented, Facilitated...).
5. HONESTY: Ground it in the candidate's resume context. Do NOT invent employers, tools, degrees or numbers. Only use a number if that exact number appears in the resume context; otherwise describe the outcome without numbers.
6. OUTPUT: Only the bullet text. No quotation marks, bullet characters, labels, markdown or explanations.`;

  const userPrompt = `Target Role: ${targetRole}
Skill: ${skill}
Required keyword (must appear verbatim): ${mustInclude}
${candidateResume ? `Candidate's experience bullets:\n${candidateResume}` : "Candidate's experience bullets: Not provided"}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  // bolt-e4b sat in NVIDIA's queue for 40-100s per call; lightning with thinking off answers in ~1-2s.
  // Abort well before the function limit so the UI can offer "Try again" instead of hanging.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    let best = null;
    // One retry with feedback when the bullet drops the keyword or invents numbers.
    for (let attempt = 0; attempt < 2; attempt++) {
      const raw = await complete(messages, controller.signal);
      const bullet = clean(raw);
      const problems = check(bullet, [mustInclude, skill], candidateResume);
      if (!best || problems.length < best.problems.length) best = { bullet, problems };
      if (!problems.length) break;
      messages.push(
        { role: 'assistant', content: raw },
        { role: 'user', content: `Rewrite it. ${problems.join(' ')} Keep it under 30 words. Output only the bullet.` }
      );
    }
    return res.status(200).json({ suggestion: best.bullet });
  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Suggestion timed out' });
    }
    console.error('Server Error:', error);
    return res.status(error.status || 500).json({ error: error.status ? 'Failed to generate suggestion' : 'Internal server error' });
  } finally {
    clearTimeout(timer);
  }
}

async function complete(messages, signal, retried = false) {
  const model = process.env.NVIDIA_SUGGEST_MODEL || 'nvidia/nemotron-3.5-lightning-30b-a3b';
  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NVIDIA_NIM_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 120,
      // A one-line bullet needs no reasoning; thinking only adds latency and can eat the token budget.
      chat_template_kwargs: { enable_thinking: false }
    })
  });
  // Several "Suggest" clicks in a row can trip NVIDIA's rate limit; wait briefly and try once more.
  if (response.status === 429 && !retried) {
    await new Promise(r => setTimeout(r, 1000));
    return complete(messages, signal, true);
  }
  if (!response.ok) {
    console.error('NVIDIA API Error:', await response.text());
    throw Object.assign(new Error('Upstream error'), { status: response.status });
  }
  const data = await response.json();
  const message = data.choices && data.choices[0] && data.choices[0].message;
  // Never fall back to reasoning_content: that is the model's scratch work, not a bullet.
  const content = (message && message.content) || '';
  if (!content.trim()) throw Object.assign(new Error('Empty suggestion'), { status: 502 });
  return content;
}

// Emails, links and phone numbers (9+ digits, so year ranges and metrics survive).
function scrubContact(text) {
  return String(text)
    .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, '')
    .replace(/\b(https?:\/\/|www\.)\S+|\b(linkedin|github|behance|dribbble)\.com\/\S*/gi, '')
    .replace(/\+?\d[\d\s().-]{7,}\d/g, m => ((m.match(/\d/g) || []).length >= 9 ? '' : m))
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

// Strip quotes, bullet characters and labels, and cap at 30 words.
function clean(raw) {
  const cleaned = raw
    .replace(/^[\s•\-\*"'“`]+/, '')
    .replace(/["'”`]+$/, '')
    .replace(/^(suggested bullet point|bullet point|suggestion|here is a suggested bullet point|here is a bullet point)[:\s\-]*/i, '')
    .replace(/^\*\*.*?\*\*\s*/, '')
    .trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length <= 30) return cleaned;
  let capped = words.slice(0, 30).join(' ').replace(/[,;:\s]+$/, '');
  if (!/[.!?]$/.test(capped)) capped += '.';
  return capped;
}

// Words of a phrase in order, tolerating plural endings and hyphen/space differences ("on-call" ~ "on call", "stakeholder" ~ "stakeholders").
function phraseRe(phrase) {
  const parts = phrase.toLowerCase().split(/[\s\-]+/).filter(Boolean)
    .map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/(es|s)$/, '') + '(?:e?s)?');
  return new RegExp('(^|[^a-z0-9])' + parts.join('[\\s\\-]+') + '(?=$|[^a-z0-9])', 'i');
}

function check(bullet, phrases, resumeText) {
  const problems = [];
  if (!phrases.some(p => phraseRe(p).test(bullet))) {
    problems.push(`It must include the exact phrase "${phrases[0]}".`);
  }
  // Any number-bearing token that is not in the resume (or in the keyword itself, e.g. "SOC 2") is made up.
  const known = new Set(((resumeText + ' ' + phrases.join(' ')).toLowerCase().match(/[\w$%.]*\d[\w%.]*/g) || []).map(n => n.replace(/[.,]+$/, '')));
  const invented = (bullet.toLowerCase().match(/[\w$%.]*\d[\w%.]*/g) || []).map(n => n.replace(/[.,]+$/, '')).filter(n => !known.has(n));
  if (invented.length) {
    problems.push(`Remove these numbers, they are not in the resume: ${[...new Set(invented)].join(', ')}.`);
  }
  return problems;
}

export const maxDuration = 30;
