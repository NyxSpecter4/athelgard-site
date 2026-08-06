// Athelgard Agent — Real tool-calling backend
// Vercel serverless function

const https = require('https');

const crypto = require('crypto');

// Same GitHub helpers from api/github.js
const SESSION_COOKIE = 'athelgard_github_session';

function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

function parseCookies(header = '') {
  return header.split(';').reduce((cookies, pair) => {
    const index = pair.indexOf('=');
    if (index > -1) cookies[pair.slice(0, index).trim()] = decodeURIComponent(pair.slice(index + 1).trim());
    return cookies;
  }, {});
}

function sign(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function safeEqual(left, right) {
  if (!left || !right) return false;
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function readSession(req) {
  const secret = process.env.GITHUB_SESSION_SECRET;
  if (!secret) return null;
  const raw = parseCookies(req.headers.cookie)[SESSION_COOKIE];
  if (!raw) return null;
  const [payload, signature] = raw.split('.');
  if (!payload || !safeEqual(sign(payload, secret), signature)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return session.expiresAt > Date.now() && session.token ? session : null;
  } catch { return null; }
}

function requestGitHub(path, token, method = 'GET', body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const request = https.request({
      hostname: 'api.github.com', path, method,
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'Athelgard',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    }, response => {
      let data = '';
      response.on('data', chunk => { data += chunk; });
      response.on('end', () => {
        let parsed = {};
        try { parsed = data ? JSON.parse(data) : {}; } catch { parsed = { message: 'Unexpected response' }; }
        if (response.statusCode < 200 || response.statusCode > 299) {
          const error = new Error(parsed.message || `GitHub ${response.statusCode}`);
          error.status = response.statusCode;
          return reject(error);
        }
        resolve(parsed);
      });
    });
    request.on('error', reject);
    if (payload) request.write(payload);
    request.end();
  });
}

function json(res, status, body) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(status).json(body);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch { resolve({}); }
    });
    req.on('error', reject);
  });
}

// ===== AI TOOL SCHEMA =====
const tools = {
  list_repos: {
    description: 'List the user\'s GitHub repositories',
    parameters: { type: 'object', properties: {}, required: [] },
    execute: async (token) => {
      const repos = await requestGitHub('/user/repos?sort=updated&per_page=30', token);
      return repos.map(r => ({ name: r.full_name, private: r.private, updated: r.updated_at }));
    }
  },
  read_file: {
    description: 'Read a file from a GitHub repository',
    parameters: {
      type: 'object',
      properties: {
        repo: { type: 'string', description: 'Full repo name like owner/repo' },
        path: { type: 'string', description: 'File path like README.md or src/index.js' }
      },
      required: ['repo', 'path']
    },
    execute: async (token, args) => {
      const [owner, repo] = args.repo.split('/');
      const data = await requestGitHub(`/repos/${owner}/${repo}/contents/${args.path}`, token);
      if (data.content) {
        return { content: Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf8'), size: data.size };
      }
      return { error: 'Not a file or not found' };
    }
  },
  get_repo_tree: {
    description: 'Get top-level structure of a repository',
    parameters: {
      type: 'object',
      properties: { repo: { type: 'string', description: 'Full repo name like owner/repo' } },
      required: ['repo']
    },
    execute: async (token, args) => {
      const [owner, repo] = args.repo.split('/');
      const data = await requestGitHub(`/repos/${owner}/${repo}/contents/`, token);
      return data.map(item => ({ name: item.name, type: item.type, path: item.path }));
    }
  }
};

// ===== AI CALL WITH TOOLS =====
async function callAI(messages, model, apiKey, toolsEnabled = true) {
  const toolsSchema = toolsEnabled ? Object.entries(tools).map(([name, t]) => ({
    type: 'function',
    function: { name, description: t.description, parameters: t.parameters }
  })) : [];

  const body = {
    model,
    messages,
    ...(toolsEnabled && toolsSchema.length ? { tools: toolsSchema } : {}),
    max_tokens: 2000,
    temperature: 0.7
  };

  const url = model.includes('kimi') || model.includes('moonshot')
    ? 'https://api.moonshot.cn/v1/chat/completions'
    : 'https://api.deepseek.com/v1/chat/completions';

  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message));
          resolve(parsed);
        } catch { reject(new Error('Invalid AI response')); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ===== SESSION MEMORY =====
const sessions = {}; // In-memory for now (Vercel KV later)

function getSession(sessionId) {
  return sessions[sessionId] || { messages: [] };
}

function saveSession(sessionId, session) {
  sessions[sessionId] = session;
}

// ===== MAIN HANDLER =====
module.exports = async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }
  if (req.method !== 'POST') return json(res, 405, { error: 'POST only' });

  const body = await parseBody(req);
  const { message } = body || {};
  if (!message) return json(res, 400, { error: 'Message required' });

  // Get GitHub session
  const ghSession = readSession(req);
  const hasGitHub = !!ghSession;

  // Get or create session
  const sid = parseCookies(req.headers.cookie).athelgard_session || crypto.randomUUID();
  const session = getSession(sid);

  // System prompt
  const systemPrompt = `You are Athelgard, a coding mentor with GitHub repo access.
${hasGitHub ? 'You have GitHub access. Use tools to fetch repo data when needed.' : 'GitHub is not connected. Tell user to click Connect GitHub.'}
Be concise. Use tools naturally. Don't ask for confirmation before using tools.`;

  // Build messages
  const msgs = [
    { role: 'system', content: systemPrompt },
    ...session.messages.slice(-10), // Keep last 10 messages
    { role: 'user', content: message }
  ];

  try {
    // Choose model
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_KEY;
    const kimiKey = process.env.KIMI_API_KEY || process.env.KIMI_KEY;
    const useKimi = !apiKey && !!kimiKey;
    const model = useKimi ? 'kimi-k2p6' : 'deepseek-chat';
    const key = useKimi ? kimiKey : apiKey;

    if (!key) return json(res, 503, { error: 'No AI API key configured' });

    // Call AI with tools
    const aiRes = await callAI(msgs, model, key, hasGitHub);
    const choice = aiRes.choices[0];

    // Check if AI wants to use a tool
    if (choice.message.tool_calls && hasGitHub) {
      const toolCall = choice.message.tool_calls[0];
      const toolName = toolCall.function.name;
      const toolArgs = JSON.parse(toolCall.function.arguments);

      if (tools[toolName]) {
        const result = await tools[toolName].execute(ghSession.token, toolArgs);

        // Call AI again with tool result
        const followUpMsgs = [
          ...msgs,
          { role: 'assistant', content: choice.message.content || '', tool_calls: choice.message.tool_calls },
          { role: 'tool', tool_call_id: toolCall.id, content: JSON.stringify(result) }
        ];

        const followUp = await callAI(followUpMsgs, model, key, false);
        const reply = followUp.choices[0].message.content;

        // Save session
        session.messages.push(
          { role: 'user', content: message },
          { role: 'assistant', content: reply }
        );
        saveSession(sid, session);

        return json(res, 200, { reply, model: useKimi ? 'Kimi' : 'DeepSeek', tool_used: toolName });
      }
    }

    // Normal response (no tool)
    const reply = choice.message.content;
    session.messages.push(
      { role: 'user', content: message },
      { role: 'assistant', content: reply }
    );
    saveSession(sid, session);

    return json(res, 200, { reply, model: useKimi ? 'Kimi' : 'DeepSeek' });

  } catch (error) {
    console.error('Agent error:', error.message);
    return json(res, 500, { error: error.message });
  }
};
