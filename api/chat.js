const Config = require('../modules/config');
const brain = require('../modules/brain');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }
  
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const { query, sessionId } = JSON.parse(body);
      
      // Process through brain first
      const brainResponse = await brain.process(query, { type: 'general', sessionId });
      
      if (brainResponse.response) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ response: brainResponse.response, from: 'brain' }));
      }
      
      // Fallback to AI provider
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ response: 'Athelgard heard you. AI integration coming soon.', from: 'athelgard' }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
};