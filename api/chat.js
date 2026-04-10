// api/chat.js — Healio Backend Proxy
// Supports: Google Gemini (free) + Anthropic Claude (optional)
// Fixes Safari CORS, hides API keys from browser

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { provider, ...body } = req.body || {};

  if (provider === 'gemini' || !provider) {
    const KEY = process.env.GEMINI_API_KEY;
    if (!KEY) return res.status(500).json({ error: 'Add GEMINI_API_KEY to Vercel env vars. Free at aistudio.google.com' });
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${KEY}`,
        { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
      return res.status(r.status).json(await r.json());
    } catch(e) { return res.status(500).json({ error: 'Gemini error: '+e.message }); }
  }

  if (provider === 'anthropic') {
    const KEY = process.env.ANTHROPIC_API_KEY;
    if (!KEY) return res.status(500).json({ error: 'Add ANTHROPIC_API_KEY to Vercel env vars.' });
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages',
        { method:'POST', headers:{'Content-Type':'application/json','x-api-key':KEY,'anthropic-version':'2023-06-01'}, body:JSON.stringify(body) });
      return res.status(r.status).json(await r.json());
    } catch(e) { return res.status(500).json({ error: 'Anthropic error: '+e.message }); }
  }

  return res.status(400).json({ error: 'Unknown provider' });
        }

