export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { skill, role, resume_text, resume } = req.body;

  if (!skill) {
    return res.status(400).json({ error: 'Skill is required' });
  }

  const candidateResume = (resume_text || resume || '').trim();
  const targetRole = (role && role !== 'auto' && role !== 'Detect from job description') ? role : 'Target Role';

  const systemPrompt = `You are an expert ATS resume writer.
Task: Write a single, highly tailored resume bullet point addressing a specific missing skill or criterion for a job application.

CRITICAL INSTRUCTIONS:
1. WORD LIMIT: The bullet point must be NO MORE THAN 30 WORDS. Keep it concise, punchy, and direct.
2. ACTION-ORIENTED & ATS-FRIENDLY: Begin immediately with a strong past-tense action verb (e.g., Led, Spearheaded, Architected, Facilitated, Streamlined, Implemented, Developed) and incorporate relevant industry keywords naturally.
3. TAILORING: Tailor the bullet to the user's target role and their existing resume context.
4. HONESTY & INTEGRITY: Never invent employers, degrees, metrics, unverified achievements, tools, or skills not supported by the candidate's resume context. If resume context is sparse or does not mention the skill, generate an honest, adaptable bullet illustrating realistic application or transferable experience of the skill for that role without claiming unverified credentials.
5. CLEAN OUTPUT ONLY: Output ONLY the raw bullet point text. Do NOT include quotation marks, bullet characters (•, -), introductory text (like "Here is..."), markdown bolding, labels, or explanations.`;

  const userPrompt = `Target Role: ${targetRole}
Missing Skill / Criterion: ${skill}
${candidateResume ? `Candidate Resume Context:\n${candidateResume.slice(0, 3000)}` : 'Candidate Resume Context: Not provided'}`;

  // bolt-e4b sat in NVIDIA's queue for 40-100s per call; lightning with thinking off answers in ~1-2s.
  // Abort well before the function limit so the UI can offer "Try again" instead of hanging.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const model = process.env.NVIDIA_SUGGEST_MODEL || 'nvidia/nemotron-3.5-lightning-30b-a3b';
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NVIDIA_NIM_API_KEY}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 120,
        // A one-line bullet needs no reasoning; thinking only adds latency and can eat the token budget.
        chat_template_kwargs: { enable_thinking: false }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('NVIDIA API Error:', errorText);
      return res.status(response.status).json({ error: 'Failed to generate suggestion' });
    }

    const data = await response.json();
    const message = data.choices && data.choices[0] && data.choices[0].message;
    // Never fall back to reasoning_content: that is the model's scratch work, not a bullet.
    let rawContent = (message && message.content) || '';
    if (!rawContent.trim()) {
      return res.status(502).json({ error: 'Empty suggestion' });
    }

    // Clean up formatting, quotation marks, bullet symbols, introductory labels
    let cleaned = rawContent
      .replace(/^[\s•\-\*"'“`]+/, '')
      .replace(/["'”`]+$/, '')
      .replace(/^(suggested bullet point|bullet point|suggestion|here is a suggested bullet point|here is a bullet point)[:\s\-]*/i, '')
      .replace(/^\*\*.*?\*\*\s*/, '')
      .trim();

    // Enforce 30-word maximum strictly on backend
    const words = cleaned.split(/\s+/).filter(Boolean);
    let finalBullet = cleaned;
    if (words.length > 30) {
      finalBullet = words.slice(0, 30).join(' ');
      finalBullet = finalBullet.replace(/[,;:\s]+$/, '');
      if (!/[.!?]$/.test(finalBullet)) {
        finalBullet += '.';
      }
    }

    return res.status(200).json({ suggestion: finalBullet });
  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Suggestion timed out' });
    }
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    clearTimeout(timer);
  }
}

export const maxDuration = 30;
