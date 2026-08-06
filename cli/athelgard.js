#!/usr/bin/env node
/**
 * Athelgard CLI v11.0 — Vercel Eve Agent
 * Multi-provider AI agent with tool-calling (DeepSeek, Kimi, Mistral)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

const CONFIG_DIR = path.join(os.homedir(), '.athelgard');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const GITHUB_TOKEN_FILE = path.join(CONFIG_DIR, 'github.token');
const SESSION_FILE = path.join(CONFIG_DIR, 'session.json');

// ===== CONFIG =====
function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch {
    return { 
      deepseekKey: '', 
      kimiKey: '', 
      mistralKey: '',
      defaultModel: 'deepseek',
      provider: 'deepseek'
    };
  }
}

function saveConfig(cfg) {
  if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { mode: 0o700 });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), { mode: 0o600 });
}

function loadGitHubToken() {
  try { return fs.readFileSync(GITHUB_TOKEN_FILE, 'utf8').trim(); }
  catch { return null; }
}

function saveGitHubToken(token) {
  if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { mode: 0o700 });
  fs.writeFileSync(GITHUB_TOKEN_FILE, token, { mode: 0o600 });
}

// ===== SESSION MEMORY =====
function loadSession() {
  try {
    return JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
  } catch {
    return { messages: [], repos: [], lastRepo: null };
  }
}

function saveSession(session) {
  fs.writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2), { mode: 0o600 });
}

// ===== PROVIDER CONFIG =====
const PROVIDERS = {
  deepseek: {
    hostname: 'api.deepseek.com',
    path: '/v1/chat/completions',
    model: 'deepseek-chat',
    keyEnv: 'deepseekKey'
  },
  kimi: {
    hostname: 'api.moonshot.cn',
    path: '/v1/chat/completions',
    model: 'kimi-k2p6',
    keyEnv: 'kimiKey'
  },
  mistral: {
    hostname: 'api.mistral.ai',
    path: '/v1/chat/completions',
    model: 'mistral-large-latest',
    keyEnv: 'mistralKey'
  }
};

function getProvider(name) {
  return PROVIDERS[name] || PROVIDERS.deepseek;
}

// ===== GITHUB API =====
function githubRequest(path, method = 'GET', body, token = null) {
  const authToken = token || loadGitHubToken();
  if (!authToken) throw new Error('GitHub not authenticated. Run: athelgard github login');
  
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.github.com',
      path,
      method,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'Athelgard-Agent',
        ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            const err = new Error(parsed.message || `GitHub ${res.statusCode}`);
            err.status = res.statusCode;
            return reject(err);
          }
          resolve(parsed);
        } catch { resolve(data); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// ===== TOOL DEFINITIONS (Zod-like schemas) =====
const TOOLS = {
  list_repos: {
    description: 'List the user\'s GitHub repositories',
    parameters: { type: 'object', properties: {}, required: [] },
    execute: async () => {
      const repos = await githubRequest('/user/repos?sort=updated&per_page=30');
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
    execute: async (args) => {
      const [owner, repo] = args.repo.split('/');
      const data = await githubRequest(`/repos/${owner}/${repo}/contents/${args.path}`);
      if (data.content) {
        return { 
          content: Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf8'), 
          size: data.size 
        };
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
    execute: async (args) => {
      const [owner, repo] = args.repo.split('/');
      const data = await githubRequest(`/repos/${owner}/${repo}/contents/`);
      return data.map(item => ({ name: item.name, type: item.type, path: item.path }));
    }
  },
  search_code: {
    description: 'Search for code in user\'s repositories',
    parameters: {
      type: 'object',
      properties: { query: { type: 'string', description: 'Search query like "function auth" or "TODO"' } },
      required: ['query']
    },
    execute: async (args) => {
      const results = await githubRequest(`/search/code?q=${encodeURIComponent(args.query)}+user:${(await githubRequest('/user')).login}&per_page=10`);
      return results.items.map(item => ({
        repo: item.repository.full_name,
        file: item.path,
        url: item.html_url
      }));
    }
  }
};

// ===== AI AGENT LOOP =====
async function agentLoop(userMessage, provider, session) {
  const cfg = loadConfig();
  const prov = getProvider(provider);
  const apiKey = cfg[prov.keyEnv];
  
  if (!apiKey) {
    throw new Error(`No ${provider} API key. Run: athelgard config`);
  }
  
  // Build messages with session history
  const systemPrompt = `You are Athelgard, a professional coding mentor and GitHub repository analyst.

You have access to tools that let you interact with the user's GitHub repositories.
When the user asks about their code, repos, or files, USE the appropriate tool.

Available tools:
- list_repos: List all GitHub repositories
- read_file: Read any file from any repo (format: owner/repo/path)
- get_repo_tree: Show repo structure
- search_code: Search across all repos

RULES:
1. Use tools proactively when asked about code/repos
2. Be concise but thorough
3. If GitHub is not connected, tell user to run "athelgard github login"
4. After reading a file, analyze it and provide insights`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...session.messages.slice(-20), // Keep last 20 messages
    { role: 'user', content: userMessage }
  ];
  
  // Tool definitions for AI
  const toolsSchema = Object.entries(TOOLS).map(([name, tool]) => ({
    type: 'function',
    function: {
      name,
      description: tool.description,
      parameters: tool.parameters
    }
  }));
  
  // Step 1: Call AI with tools
  let stepCount = 0;
  const maxSteps = 5;
  
  while (stepCount < maxSteps) {
    stepCount++;
    
    const response = await callAI(provider, apiKey, messages, toolsSchema);
    const choice = response.choices[0];
    
    // Check if AI wants to use a tool
    if (choice.message.tool_calls) {
      const toolCall = choice.message.tool_calls[0];
      const toolName = toolCall.function.name;
      const toolArgs = JSON.parse(toolCall.function.arguments);
      
      console.log(`  🔧 Using tool: ${toolName}(${JSON.stringify(toolArgs)})`);
      
      // Execute tool
      let result;
      try {
        if (TOOLS[toolName]) {
          result = await TOOLS[toolName].execute(toolArgs);
        } else {
          result = { error: `Unknown tool: ${toolName}` };
        }
      } catch (e) {
        result = { error: e.message };
      }
      
      // Add tool call and result to messages
      messages.push({
        role: 'assistant',
        content: choice.message.content || '',
        tool_calls: choice.message.tool_calls
      });
      
      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(result)
      });
      
      // Continue loop - AI will process tool result
      continue;
    }
    
    // No tool call - return final response
    const finalResponse = choice.message.content;
    
    // Update session
    session.messages.push(
      { role: 'user', content: userMessage },
      { role: 'assistant', content: finalResponse }
    );
    saveSession(session);
    
    return {
      text: finalResponse,
      model: provider,
      steps: stepCount,
      provider: prov.model
    };
  }
  
  throw new Error('Agent reached maximum steps without completing');
}

// ===== AI API CALL =====
function callAI(provider, apiKey, messages, tools) {
  const prov = getProvider(provider);
  
  const body = {
    model: prov.model,
    messages,
    ...(tools.length ? { tools } : {}),
    max_tokens: 2000,
    temperature: 0.7
  };
  
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = https.request({
      hostname: prov.hostname,
      path: prov.path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) throw new Error(parsed.error.message);
          resolve(parsed);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ===== COMMANDS =====
const commands = {
  async connect(args) {
    const code = args[0];
    if (!code) {
      console.log('Usage: athelgard connect <code>');
      console.log('');
      console.log('Get a code from https://athelgard.io after logging in with GitHub.');
      return;
    }
    
    console.log(`🔗 Connecting CLI with code ${code}...`);
    
    try {
      const result = await new Promise((resolve, reject) => {
        const payload = JSON.stringify({ code });
        const req = https.request({
          hostname: 'athelgard.io',
          path: '/api/health?path=github&action=cli-connect',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          }
        }, res => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              if (res.statusCode >= 400) reject(new Error(parsed.error || `HTTP ${res.statusCode}`));
              else resolve(parsed);
            } catch { reject(new Error(data)); }
          });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
      });
      
      // Save the token
      saveGitHubToken(result.token);
      console.log(`✅ Connected as ${result.user.login}!`);
      console.log(`   You can now use: athelgard repo, athelgard chat, etc.`);
      
    } catch (e) {
      console.log(`❌ Connection failed: ${e.message}`);
      console.log('   Make sure you generated the code at https://athelgard.io');
    }
  },
  
  async github(args) {
    const sub = args[0];
    
    if (sub === 'login' || sub === 'token') {
      const token = await prompt('Paste your GitHub Personal Access Token: ');
      if (!token) { console.log('❌ No token provided'); return; }
      
      // Test the token
      try {
        const user = await githubRequest('/user', 'GET', null, token);
        saveGitHubToken(token);
        console.log(`✅ Authenticated as ${user.login} (${user.name || 'no name'})`);
      } catch (e) {
        console.log(`❌ Invalid token: ${e.message}`);
      }
      return;
    }
    
    if (sub === 'status') {
      const token = loadGitHubToken();
      if (!token) { console.log('❌ Not authenticated. Run: athelgard github login'); return; }
      try {
        const user = await githubRequest('/user');
        console.log(`✅ Authenticated as ${user.login} (${user.name || 'no name'})`);
      } catch (e) { console.log(`❌ Token invalid: ${e.message}`); }
      return;
    }
    
    if (sub === 'logout') {
      try { fs.unlinkSync(GITHUB_TOKEN_FILE); fs.unlinkSync(SESSION_FILE); } catch {}
      console.log('👋 Logged out');
      return;
    }
    
    if (sub === 'repos' || sub === 'list') {
      const repos = await githubRequest('/user/repos?sort=updated&per_page=50');
      console.log('\n📁 Your Repositories\n');
      repos.forEach(r => {
        const vis = r.private ? '🔒' : '🌐';
        console.log(`  ${vis} ${r.full_name}`);
        console.log(`     ${r.description || 'No description'} | Updated: ${new Date(r.updated_at).toLocaleDateString()}`);
        console.log('');
      });
      return;
    }
    
    console.log('Usage: athelgard github <login|status|logout|repos>');
  },
  
  async repo(args) {
    const [repo, action, ...rest] = args;
    if (!repo) { console.log('Usage: athelgard repo <owner/repo> [ls|cat <file>|tree]'); return; }
    
    const [owner, name] = repo.split('/');
    if (!owner || !name) { console.log('❌ Format: owner/repo'); return; }
    
    if (!action || action === 'ls' || action === 'list') {
      const contents = await githubRequest(`/repos/${owner}/${name}/contents/`);
      console.log(`\n📂 ${repo}/\n`);
      contents.forEach(item => console.log(`  ${item.type === 'dir' ? '📁' : '📄'} ${item.name}`));
      console.log('');
      return;
    }
    
    if (action === 'cat' || action === 'read') {
      const filePath = rest[0] || '';
      if (!filePath) { console.log('Usage: athelgard repo owner/repo cat <file>'); return; }
      const data = await githubRequest(`/repos/${owner}/${name}/contents/${filePath}`);
      if (data.content) {
        const content = Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf8');
        console.log(`\n📄 ${repo}/${filePath}\n`);
        console.log(content);
        console.log('');
      } else { console.log('❌ Not a file'); }
      return;
    }
    
    if (action === 'tree') {
      const tree = await githubRequest(`/repos/${owner}/${name}/git/trees/HEAD?recursive=1`);
      console.log(`\n🌳 ${repo}/\n`);
      tree.tree.slice(0, 100).forEach(item => console.log(`  ${item.type === 'tree' ? '📁' : '📄'} ${item.path}`));
      if (tree.tree.length > 100) console.log(`  ... and ${tree.tree.length - 100} more files`);
      console.log('');
      return;
    }
    
    console.log('Usage: athelgard repo <owner/repo> [ls|cat <file>|tree]');
  },
  
  async chat(args) {
    const cfg = loadConfig();
    const provider = args[0] || cfg.provider || 'deepseek';
    
    console.log(`🦉 Athelgard Agent (${provider})`);
    console.log('Tools: list_repos, read_file, get_repo_tree, search_code');
    console.log('Type "exit" or press Ctrl+C to quit\n');
    
    const session = loadSession();
    
    while (true) {
      const input = await prompt('You: ');
      if (!input || input.toLowerCase() === 'exit') break;
      
      if (input.toLowerCase() === 'clear') {
        session.messages = [];
        saveSession(session);
        console.log('🗑️  Session cleared\n');
        continue;
      }
      
      try {
        process.stdout.write('Athelgard: ');
        const result = await agentLoop(input, provider, session);
        console.log(`${result.text}\n`);
        console.log(`  — _${result.model} (${result.steps} step${result.steps > 1 ? 's' : ''})_\n`);
      } catch (e) {
        console.log(`❌ ${e.message}\n`);
      }
    }
    
    console.log('\n👋 Goodbye');
  },
  
  async config() {
    const cfg = loadConfig();
    console.log('\n⚙️  Configuration\n');
    console.log(`DeepSeek Key: ${cfg.deepseekKey ? '✅ Set' : '❌ Not set'}`);
    console.log(`Kimi Key:     ${cfg.kimiKey ? '✅ Set' : '❌ Not set'}`);
    console.log(`Mistral Key:  ${cfg.mistralKey ? '✅ Set' : '❌ Not set'}`);
    console.log(`Default:      ${cfg.provider || 'deepseek'}\n`);
    
    const ds = await prompt('DeepSeek API key (or Enter to keep): ');
    if (ds) cfg.deepseekKey = ds;
    
    const kimi = await prompt('Kimi API key (or Enter to keep): ');
    if (kimi) cfg.kimiKey = kimi;
    
    const mistral = await prompt('Mistral API key (or Enter to keep): ');
    if (mistral) cfg.mistralKey = mistral;
    
    const provider = await prompt('Default provider (deepseek/kimi/mistral) [deepseek]: ');
    if (provider) cfg.provider = provider;
    
    saveConfig(cfg);
    console.log('✅ Saved\n');
    
    // Test the chosen provider
    if (cfg.provider && cfg[PROVIDERS[cfg.provider]?.keyEnv]) {
      console.log(`Testing ${cfg.provider}...`);
      try {
        const response = await callAI(cfg.provider, cfg[PROVIDERS[cfg.provider].keyEnv], [
          { role: 'system', content: 'Say "connected" only.' },
          { role: 'user', content: 'Test' }
        ], []);
        console.log(`✅ ${cfg.provider} works!\n`);
      } catch (e) {
        console.log(`❌ ${cfg.provider} error: ${e.message}\n`);
      }
    }
  },
  
  async agent(args) {
    // One-shot agent command
    const query = args.join(' ');
    if (!query) {
      console.log('Usage: athelgard agent "<query>"');
      console.log('Example: athelgard agent "List my repos"');
      return;
    }
    
    const cfg = loadConfig();
    const provider = cfg.provider || 'deepseek';
    const session = loadSession();
    
    try {
      const result = await agentLoop(query, provider, session);
      console.log(result.text);
      console.log(`\n— _${result.model} (${result.steps} step${result.steps > 1 ? 's' : ''})_`);
    } catch (e) {
      console.log(`❌ ${e.message}`);
    }
  },
  
  help() {
    console.log(`
🦉 Athelgard CLI — Professional Coding Agent

USAGE:
  athelgard <command> [args]

QUICK START:
  athelgard config              # Set your API keys (DeepSeek/Kimi/Mistral)
  athelgard connect <code>      # Connect CLI via web login (no PAT needed!)
  athelgard github login        # Paste your GitHub PAT (alternative)
  athelgard chat                # Start coding with AI + GitHub

WEB LOGIN (Recommended):
  1. Go to https://athelgard.io
  2. Click "Login with GitHub"
  3. Click "Connect CLI" to get a code
  4. Run: athelgard connect <code>
  5. Start coding immediately!

GITHUB:
  github login                  # Paste GitHub Personal Access Token
  github status                 # Check auth status
  github logout                 # Remove token
  github repos                  # List your repositories

REPO:
  repo <owner/repo>             # List repo contents
  repo <owner/repo> cat <file>  # Read file
  repo <owner/repo> tree        # Full file tree

AGENT:
  chat [provider]               # Interactive AI chat (deepseek/kimi/mistral)
  agent "<query>"               # One-shot query

CONFIG:
  config                        # Set API keys

EXAMPLES:
  athelgard connect ABCD-1234
  athelgard chat
  athelgard agent "Review my bountywarz repo"
  athelgard repo NyxSpecter4/bountywarz cat README.md
`);
  }
};

// ===== PROMPT HELPER =====
function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => { rl.close(); resolve(answer.trim()); });
  });
}

// ===== MAIN =====
async function main() {
  const [,, cmd, ...args] = process.argv;
  
  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
    commands.help();
    return;
  }
  
  if (commands[cmd]) {
    try {
      await commands[cmd](args);
    } catch (e) {
      console.error(`❌ Error: ${e.message}`);
      process.exit(1);
    }
  } else {
    console.log(`Unknown command: ${cmd}`);
    commands.help();
  }
}

main();
