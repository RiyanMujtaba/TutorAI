require('dotenv').config();
const express = require('express');
const path    = require('path');
const Groq    = require('groq-sdk');

const app  = express();
const PORT = process.env.PORT || 3000;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const SYSTEM_PROMPT = `You are TutorAI, a warm and patient school tutor. You help students with any subject — maths, science, history, english, coding, anything.

Your personality:
- Calm, encouraging, never condescending
- Explain things simply, step by step
- Use relatable examples (sports, food, games, everyday life)
- Celebrate when students get something right
- If they're confused, try a different explanation
- Keep responses conversational and not too long — you're speaking out loud, not writing an essay
- Never say "Great question!" — just answer naturally like a friendly tutor would

Always be the kind of tutor every student wishes they had.`;

app.post('/api/chat', async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ error: 'No message provided' });

  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text })),
      { role: 'user', content: message }
    ];

    const result = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7
    });

    res.json({ reply: result.choices[0].message.content });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════╗`);
  console.log(`║  TutorAI — port ${PORT}          ║`);
  console.log(`╚══════════════════════════════╝\n`);
  console.log(`Open: http://localhost:${PORT}\n`);
});
