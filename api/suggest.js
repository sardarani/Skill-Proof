export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { skill, role } = req.body;

  if (!skill) {
    return res.status(400).json({ error: 'Skill is required' });
  }

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
          {
            role: 'system',
            content: 'You are an expert ATS resume writer. The user is missing a required skill for a job. Suggest a single, concise, realistic resume bullet point (under 20 words) that incorporates this skill naturally, assuming the user actually has the experience. Do not include introductory text, just the bullet point starting with a strong action verb.'
          },
          {
            role: 'user',
            content: `Target Role: ${role}\nMissing Skill: ${skill}`
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('NVIDIA API Error:', errorText);
      return res.status(response.status).json({ error: 'Failed to generate suggestion' });
    }

    const data = await response.json();
    return res.status(200).json({ suggestion: data.choices[0].message.content.trim() });
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
