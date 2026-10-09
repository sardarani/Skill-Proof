export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { target_role, resume_text, job_description } = req.body;

  if (!resume_text || !job_description) {
    return res.status(400).json({ error: 'Resume and Job Description are required' });
  }

  const systemPrompt = `You are the Role Insights engine for Skill Proof, a resume-matching tool.

GOAL
Find out what the employer requires for this role based on the provided job description, then show the user
(1) which skills are true must-haves, (2) which are nice-to-haves, and
(3) where their resume can be improved, with evidence.

STEP 1: EXTRACT AND NORMALIZE SKILLS
- Pull every skill, tool, qualification, and experience requirement from the job description.
- Merge synonyms into one canonical name (e.g. "JS" and "JavaScript", "stakeholder management" and "working with stakeholders").
- Tag each as hard skill, soft skill, tool, certification, or experience.
- Note whether the posting marks it as required ("must have", "required", "X+ years") or preferred ("nice to have", "bonus", "plus").

STEP 2: CLASSIFY
- MUST-HAVE: explicitly required in the job description.
- NICE-TO-HAVE: marked as preferred or optional.

STEP 3: COMPARE WITH THE RESUME
For each must-have and nice-to-have skill, label the resume as one of:
- BACKED: skill appears with a concrete example (action, tool, and result, ideally with a number).
- LISTED ONLY: named, but no example showing it was used.
- DIFFERENT WORDING: the idea is covered but with other terms. Quote the matching phrase.
- MISSING: no sign of it.
Quote the exact resume text as evidence. Never invent resume content.

STEP 4: IMPROVEMENT SUGGESTIONS
- Rank gaps by impact: must-haves first.
- For each gap, give a specific action:
  - LISTED ONLY: suggest how to add a real example.
  - DIFFERENT WORDING: suggest which market term to use.
  - MISSING: ask whether the user has this experience. If yes, say where to add it. If no, suggest a realistic way to build it.
- Give at most 7 priority improvements.

OUTPUT FORMAT: Return ONLY valid JSON in the exact structure below, no markdown formatting or extra text.
{
  "role": "${target_role || 'Candidate'}",
  "confidence": "high",
  "must_haves": [
    {
      "skill": "",
      "category": "",
      "resume_status": "backed | listed_only | different_wording | missing",
      "resume_evidence": "",
      "improvement": ""
    }
  ],
  "nice_to_haves": [
    {
      "skill": "",
      "category": "",
      "resume_status": "backed | listed_only | different_wording | missing",
      "resume_evidence": "",
      "improvement": ""
    }
  ],
  "summary": {
    "must_haves_backed": "0 of N",
    "headline": "",
    "top_priorities": ["", "", ""]
  }
}`;

  try {
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NVIDIA_NIM_API_KEY}`
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-8b-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Job Description:\n${job_description}\n\nResume:\n${resume_text}` }
        ],
        temperature: 0.2,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('NVIDIA API Error:', errorText);
      return res.status(response.status).json({ error: 'Failed to analyze' });
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    // Find the first { and last } to extract JSON safely, ignoring markdown wrappers
    const startIdx = content.indexOf('{');
    const endIdx = content.lastIndexOf('}');
    if (startIdx === -1 || endIdx === -1) {
      throw new Error('No JSON object found in response');
    }
    const jsonString = content.substring(startIdx, endIdx + 1);

    const jsonResult = JSON.parse(jsonString);
    return res.status(200).json(jsonResult);
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

export const maxDuration = 60; // Increase Vercel timeout to 60 seconds
