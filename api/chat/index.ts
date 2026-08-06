import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { query, sessionId } = req.body;
    // Simple response for now - full AI integration coming
    return res.status(200).json({
      response: 'Athelgard heard you: ' + (query || 'Hello!'),
      sessionId: sessionId || null,
      from: 'athelgard'
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}