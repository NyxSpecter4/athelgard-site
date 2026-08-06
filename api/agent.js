const https = require('https');

// ─── TOOLS ───
const TOOLS = {
  list_repos: {
    description: 'List all GitHub repositories for the authenticated user',
    parameters: { type: 'object', properties: {} },
    execute: async (args, token) => {
      return new Promise((resolve, reject) => {
        const r = https.request({
          hostname: 'api.github.com', path: '/user/repos?sort=updated&per_page=30',
          headers: { 'Authorization': `Bearer ${token}`, 'User-Agent': 'Athelgard', 'Accept': 'application/vnd.github+json' }
        }, res => {
          let d = '';
          res.on('data', c => d += c);
          res.on('end', () => { try { resolve(JSON.parse(d).map(r => ({ full_name: r.full_name, private: r.private, updated_at: r.updated_at }))); } catch { reject(new Error('Bad response')); } });
        });
        r.on('error', reject);
        r.end();
      });
    }
  },
  read_file: {
    description: 'Read a file from a GitHub repository. Args: {owner, repo, path}',
    parameters: { type: 'object', properties: { owner: {type:'string'}, repo: {type:'string'}, path: {type:'string'} }, required: ['owner','repo','path'] },
    execute: async (args, token) => {
      return new Promise((resolve, reject) => {
        const r = https.request({
          hostname: 'api.github.com', path: `/repos/${encodeURIComponent(args.owner)}/${encodeURIComponent(args.repo)}/contents/${encodeURIComponent(args.path)}`,
          headers: { 'Authorization': `Bearer ${token}`, 'User-Agent': 'Athelgard', 'Accept': 'application/vnd.github+json' }
        }, res => {
          let d = '';
          res.on('data', c => d += c);
          res.on('end', () => {
            try {
              const data = JSON.parse(d);
              if (data.content) {
                const content = Buffer.from(data.content.replace(/\n/g,''), 'base64').toString('utf8');
                resolve({ content: content.substring(0, 5000), path: args.path, sha: data.sha });
              } else {
                resolve(data);
              }
            } catch { reject(new Error('Bad response')); }
          });
        });
        r.on('error', reject);
        r.end();
      });
    }
  },
  get_repo_tree: {
    description: 'Get file tree of a repository. Args: {owner, repo}',
    parameters: { type: 'object', properties: { owner: {type:'string'}, repo: {type:'string'} }, required: ['owner','repo'] },
    execute: async (args, token) => {
      return new Promise((resolve, reject) => {
        const r = https.request({
          hostname: 'api.github.com', path: `/repos/${encodeURIComponent(args.owner)}/${encodeURIComponent(args.repo)}/git/trees/HEAD?recursive=1`,
          headers: { 'Authorization': `Bearer ${token}`, 'User-Agent': 'Athelgard', 'Accept': 'application/vnd.github+json' }
        }, res => {
          let d = '';
          res.on('data', c => d += c);
          res.on('end', () => { try { const data = JSON.parse(d); resolve(data.tree ? data.tree.map(t => ({ path: t.path, type: t.type })) : []); } catch { reject(new Error('Bad response')); } });
        });
        r.on('error', reject);
        r.end();
      });
    }
  }
};

// ─── AI CALLER ───
function callAI(apiKey, messages, tools) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature: 0.7,
      max_tokens: 2000,
      ...(tools ? { tools } : {})
    });
    const r = https.request({
      hostname: 'api.deepseek.com', path: '/v1/chat/completions', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`, 'Content-Length': Buffer.byteLength(data) }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { reject(new Error('Bad JSON')); } });
    });
    r.on('error', reject);
    r.write(data);
    r.end();
  });
}

// ─── AGENT LOOP ───
async function agentLoop(message, token, apiKey, mode = 'mentor') {
  const mentorPrompt = `You are Athelgard, a professional coding mentor and GitHub repository analyst.
You have access to tools that let you interact with the user's GitHub repositories.
When the user asks about their code, repos, or files, USE the appropriate tool.
Available tools:
- list_repos: List all GitHub repositories
- read_file: Read any file from any repo
- get_repo_tree: Show repo structure
RULES:
1. Use tools proactively when asked about code/repos
2. Be concise but thorough
3. After reading a file, analyze it and provide insights`;

  const builderPrompt = `You are Athelgard in BUILDER MODE — a technical coding agent for BountyWarz.
You produce structured, actionable output following this format:
SITUATION → IMPACTED SYSTEMS → PLAN → PATCH → VERIFY → RISKS
You have access to GitHub repo tools. Use them to scan, map, plan, patch, and verify.
Available tools:
- list_repos: List all GitHub repositories
- read_file: Read any file from any repo
- get_repo_tree: Show repo structure
RULES:
1. Scan first, then map, then plan, then patch, then verify
2. Smallest safe changes only
3. Explicit approvals before destructive operations
4. Structured output always`;

  const messages = [
    { role: 'system', content: mode === 'builder' ? builderPrompt : mentorPrompt },
    { role: 'user', content: message }
  ];

  const toolsSchema = Object.entries(TOOLS).map(([name, tool]) => ({
    type: 'function',
    function: { name, description: tool.description, parameters: tool.parameters }
  }));

  let stepCount = 0;
  const maxSteps = 5;

  while (stepCount < maxSteps) {
    stepCount++;
    const response = await callAI(apiKey, messages, toolsSchema);
    const choice = response.choices[0];

    if (choice.message.tool_calls) {
      const toolCall = choice.message.tool_calls[0];
      const toolName = toolCall.function.name;
      const toolArgs = JSON.parse(toolCall.function.arguments);

      let result;
      try {
        result = TOOLS[toolName] ? await TOOLS[toolName].execute(toolArgs, token) : { error: `Unknown tool: ${toolName}` };
      } catch (e) {
        result = { error: e.message };
      }

      messages.push({ role: 'assistant', content: choice.message.content || '', tool_calls: choice.message.tool_calls });
      messages.push({ role: 'tool', tool_call_id: toolCall.id, content: JSON.stringify(result) });
    } else {
      return { response: choice.message.content, steps: stepCount };
    }
  }

  return { response: 'Agent reached maximum steps.', steps: stepCount };
}

// ─── EXPORT ───
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.VERCEL ? 'https://athelgard.io' : 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Read session from cookie
  const cookies = require('crypto');
  const parseCookies = (h = '') => h.split(';').reduce((o, p) => { const i = p.indexOf('='); if (i > -1) o[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); return o; }, {});
  const SESSION_COOKIE = 'athelgard_session';
  const raw = parseCookies(req.headers.cookie || '')[SESSION_COOKIE];
  if (!raw) return res.status(401).json({ error: 'Not authenticated' });

  const [payload] = raw.split('.');
  let session;
  try { session = JSON.parse(Buffer.from(payload, 'base64url').toString()); } catch { return res.status(401).json({ error: 'Invalid session' }); }
  if (!session.token) return res.status(401).json({ error: 'No token' });

  const { message, mode } = req.body || {};
  if (!message) return res.status(400).json({ error: 'Message required' });

  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_KEY;
  if (!apiKey) return res.status(503).json({ error: 'AI not configured' });

  try {
    const result = await agentLoop(message, session.token, apiKey, mode);
    return res.status(200).json({ response: result.response, steps: result.steps });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
