import { VercelRequest, VercelResponse } from '@vercel/node';

// Import our brain module - need to convert to TS or use require
const brain = require('../../modules/brain');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  try {
    const { query } = req;
    const result = await brain.process(query?.q || '', { type: query?.type || 'general' });
    return res.status(200).json({ ...result, from: 'brain' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}