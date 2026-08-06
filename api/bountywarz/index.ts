import { VercelRequest, VercelResponse } from '@vercel/node';

const sessions = new Map();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  const { method } = req;
  const pathParts = req.url?.split('/') || [];
  const action = pathParts[pathParts.length - 1];
  
  if (method === 'POST' && action === 'session') {
    const { userId, mode, difficulty } = req.body;
    const sessionId = 'session_' + Date.now();
    const session = { id: sessionId, userId, mode: mode || 'drone', difficulty: difficulty || 'normal', createdAt: Date.now() };
    sessions.set(sessionId, session);
    return res.status(200).json(session);
  }
  
  if (method === 'GET') {
    return res.status(200).json({ status: 'ok', message: 'BountyWarz API bridge active', sessions: sessions.size });
  }
  
  return res.status(200).json({ status: 'ok', message: 'BountyWarz API' });
}