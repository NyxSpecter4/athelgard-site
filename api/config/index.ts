import { VercelRequest, VercelResponse } from '@vercel/node';
const Config = require('../../modules/config');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json(Config.getStatus());
}