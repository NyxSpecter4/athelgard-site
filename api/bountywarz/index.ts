// BountyWarz API bridge (TypeScript)

const sessions = new Map<string, any>();

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(204).end();
  
  if (req.method === 'POST') {
    const { userId, mode = 'drone', difficulty = 'normal' } = req.body || {};
    const id = 'session_' + Date.now();
    const session = { id, userId, createdAt: Date.now(), mode, difficulty };
    sessions.set(id, session);
    return res.status(200).json({ status: 'ok', session });
  }
  
  return res.status(200).json({ status: 'ok', message: 'BountyWarz API bridge active', sessions: sessions.size });
}
