import { VercelRequest, VercelResponse } from '@vercel/node';

const brain = require('../../modules/brain');
const Config = require('../../modules/config');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  return res.status(200).json({
    status: 'ok',
    version: '2.0.0',
    timestamp: Date.now(),
    uptime: process.uptime(),
    brain: brain.getStatus(),
    config: Config.getStatus(),
    message: 'Athelgard - Merge Master Active'
  });
}