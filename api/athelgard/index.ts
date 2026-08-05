import { VercelRequest, VercelResponse } from '@vercel/node';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { input, mode = 'code', userId, sessionId, apiKeys = {} } = req.body || {};
    if (!input) return res.status(400).json({ error: 'Missing input' });

    return res.status(200).json({
      id: uuidv4(),
      output: { response: input, mode, model: apiKeys.deepSeek ? 'deepseek' : apiKeys.kimi ? 'kimi' : 'default' },
      mode,
      timestamp: new Date().toISOString(),
      sessionId: sessionId || uuidv4()
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}