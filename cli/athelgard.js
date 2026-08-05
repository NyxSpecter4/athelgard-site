#!/usr/bin/env node
/**
 * Athelgard CLI — Professional GitHub + AI Coding Agent
 * One tool. One connector. Zero web UI.
 */

const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const CONFIG_DIR = path.join(require('os').homedir(), '.athelgard');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const GITHUB_TOKEN_FILE = path.join(CONFIG_DIR, 'github.token');

// ===== CONFIG =====
function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch {
    return { deepseekKey: '', kimiKey: '', defaultModel: 'deepseek' };
  }
}

function saveConfig(cfg) {
  if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { mode: 0o700 });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), { mode: 0o600 });
}

function loadGitHubToken() {
  try {
    return fs.readFileSync(GITHUB_TOKEN_FILE, 'utf8').trim();
  } catch {
    return null;
  }
}

function saveGitHubToken(token) {
  if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { mode: 0o700 });
  fs.writeFileSync(GITHUB_TOKEN_FILE, token, { mode: 0o600 });
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
        'User-Agent': 'Athelgard-CLI',
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

// ===== AI API =====
async function askAI(messages, model) {
  const cfg = loadConfig();
  const isKimi = model === 'kimi' || model.includes('kimi');
  const key = isKimi ? cfg.kimiKey : cfg.deepseekKey;
  
  if (!key) {
    throw new Error(`No ${isKimi ? 'Kimi' : 'DeepSeek'} API key. Run: athelgard config`);
  }
  
  const url = isKimi ? 'api.moonshot.cn' : 'api.deepseek.com';
  const modelName = isKimi ? 'kimi-k2p6' : 'deepseek-chat';
  
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: modelName,
      messages,
      max_tokens: 2000,
      temperature: 0.7
    });
    
    const req = https.request({
      hostname: url,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) throw new Error(parsed.error.message);
          resolve(parsed.choices[0].message.content);
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
  async github(args) {
    const sub = args[0];
    
    if (sub === 'login') {
      console.log('🔐 GitHub Device Flow Authentication\n');
      
      // Use the existing Athelgard OAuth App
      const CLIENT_ID = 'Ov23liVfeEpVstSC4KZ4';
      
      // Step 1: Request device code
      const deviceCodeRes = await new Promise((resolve, reject) => {
        const payload = JSON.stringify({
          client_id: CLIENT_ID,
          scope: 'repo read:user'
        });
        
        const req = https.request({
          hostname: 'github.com',
          path: '/login/device/code',
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'Athelgard-CLI'
          }
        }, res => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch { reject(new Error('Invalid response from GitHub')); }
          });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
      });
      
      if (deviceCodeRes.error) {
        console.log('❌ GitHub Error:', deviceCodeRes.error_description);
        console.log('Device flow may need to be enabled for this OAuth app.');
        return;
      }
      
      console.log('============================================');
      console.log('  Go to:', deviceCodeRes.verification_uri);
      console.log('  Enter code:', deviceCodeRes.user_code);
      console.log('============================================\n');
      console.log('Waiting for you to authorize...\n');
      
      // Step 2: Poll for access token
      const interval = (deviceCodeRes.interval || 5) * 1000;
      const expiresAt = Date.now() + (deviceCodeRes.expires_in || 900) * 1000;
      
      const token = await new Promise((resolve, reject) => {
        const poll = async () => {
          if (Date.now() > expiresAt) {
            reject(new Error('Authentication timed out'));
            return;
          }
          
          try {
            const res = await new Promise((resolve, reject) => {
              const payload = JSON.stringify({
                client_id: CLIENT_ID,
                device_code: deviceCodeRes.device_code,
                grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
              });
              
              const req = https.request({
                hostname: 'github.com',
                path: '/login/oauth/access_token',
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'User-Agent': 'Athelgard-CLI'
                }
              }, r => {
                let data = '';
                r.on('data', chunk => data += chunk);
                r.on('end', () => {
                  try { resolve(JSON.parse(data)); } 
                  catch { resolve({}); }
                });
              });
              req.on('error', reject);
              req.write(payload);
              req.end();
            });
            
            if (res.access_token) {
              resolve(res.access_token);
            } else if (res.error === 'authorization_pending') {
              process.stdout.write('.');
              setTimeout(poll, interval);
            } else if (res.error === 'slow_down') {
              setTimeout(poll, (res.interval || 5) * 1000);
            } else {
              reject(new Error(res.error_description || res.error || 'Unknown error'));
            }
          } catch (e) {
            reject(e);
          }
        };
        
        poll();
      });
      
      console.log('\n✅ Authorized!');
      
      // Verify and save
      const user = await githubRequest('/user', token);
      saveGitHubToken(token);
      console.log(`✅ Authenticated as ${user.login}`);
      return;
    }
    
    if (sub === 'status') {
      const token = loadGitHubToken();
      if (!token) {
        console.log('❌ Not authenticated');
        return;
      }
      try {
        const user = await githubRequest('/user');
        console.log(`✅ Authenticated as ${user.login} (${user.name || 'no name'})`);
      } catch (e) {
        console.log(`❌ Token invalid: ${e.message}`);
      }
      return;
    }
    
    if (sub === 'logout') {
      try { fs.unlinkSync(GITHUB_TOKEN_FILE); } catch {}
      console.log('👋 Logged out');
      return;
    }
    
    if (sub === 'repos' || sub === 'list') {
      const repos = await githubRequest('/user/repos?sort=updated&per_page=50');
      console.log('\n📁 Your Repositories\n');
      repos.forEach(r => {
        const vis = r.private ? '🔒' : '🌐';
        const updated = new Date(r.updated_at).toLocaleDateString();
        console.log(`  ${vis} ${r.full_name}`);
        console.log(`     ${r.description || 'No description'} | Updated: ${updated}`);
        console.log('');
      });
      return;
    }
    
    console.log('Usage: athelgard github <login|status|logout|repos>');
  },
  
  async repo(args) {
    const [repo, action, ...rest] = args;
    if (!repo) {
      console.log('Usage: athelgard repo <owner/repo> [ls|cat <file>|tree]');
      return;
    }
    
    const [owner, name] = repo.split('/');
    if (!owner || !name) {
      console.log('❌ Format: owner/repo');
      return;
    }
    
    if (!action || action === 'ls' || action === 'list') {
      const contents = await githubRequest(`/repos/${owner}/${name}/contents/`);
      console.log(`\n📂 ${repo}/\n`);
      contents.forEach(item => {
        const icon = item.type === 'dir' ? '📁' : '📄';
        console.log(`  ${icon} ${item.name}`);
      });
      console.log('');
      return;
    }
    
    if (action === 'cat' || action === 'read') {
      const filePath = rest[0] || '';
      if (!filePath) {
        console.log('Usage: athelgard repo owner/repo cat <file>');
        return;
      }
      const data = await githubRequest(`/repos/${owner}/${name}/contents/${filePath}`);
      if (data.content) {
        const content = Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf8');
        console.log(`\n📄 ${repo}/${filePath}\n`);
        console.log(content);
        console.log('');
      } else {
        console.log('❌ Not a file');
      }
      return;
    }
    
    if (action === 'tree') {
      const tree = await githubRequest(`/repos/${owner}/${name}/git/trees/HEAD?recursive=1`);
      console.log(`\n🌳 ${repo}/\n`);
      tree.tree.slice(0, 100).forEach(item => {
        const icon = item.type === 'tree' ? '📁' : '📄';
        console.log(`  ${icon} ${item.path}`);
      });
      if (tree.tree.length > 100) console.log(`  ... and ${tree.tree.length - 100} more files`);
      console.log('');
      return;
    }
    
    console.log('Usage: athelgard repo <owner/repo> [ls|cat <file>|tree]');
  },
  
  async chat(args) {
    const cfg = loadConfig();
    const model = args[0] || cfg.defaultModel || 'deepseek';
    
    console.log(`🦉 Athelgard CLI Chat (${model})`);
    console.log('Type "exit" or press Ctrl+C to quit\n');
    
    const history = [];
    
    while (true) {
      const input = await prompt('You: ');
      if (!input || input.toLowerCase() === 'exit') break;
      
      // Check for repo commands
      const repoMatch = input.match(/^\s*(?:show|list)\s+repos?\s*$/i);
      const fileMatch = input.match(/^\s*read\s+(.+)\s+from\s+(.+)\s*$/i);
      
      if (repoMatch) {
        try {
          const repos = await githubRequest('/user/repos?sort=updated&per_page=20');
          console.log('\n📁 Your Repos:');
          repos.forEach(r => console.log(`  ${r.full_name}`));
          console.log('');
          continue;
        } catch (e) {
          console.log(`❌ ${e.message}\n`);
          continue;
        }
      }
      
      if (fileMatch) {
        try {
          const filePath = fileMatch[1].trim();
          const repo = fileMatch[2].trim();
          const [owner, name] = repo.split('/');
          const data = await githubRequest(`/repos/${owner}/${name}/contents/${filePath}`);
          if (data.content) {
            const content = Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf8');
            history.push({ role: 'user', content: `Review this code from ${repo}/${filePath}:\n\n${content}` });
          }
        } catch (e) {
          console.log(`❌ ${e.message}\n`);
          continue;
        }
      } else {
        history.push({ role: 'user', content: input });
      }
      
      try {
        process.stdout.write('Athelgard: ');
        const reply = await askAI(history, model);
        console.log(`${reply}\n`);
        history.push({ role: 'assistant', content: reply });
        
        // Keep history manageable
        if (history.length > 20) history.splice(0, 2);
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
    console.log(`Default Model: ${cfg.defaultModel || 'deepseek'}`);
    console.log('');
    
    const ds = await prompt('DeepSeek API key (or Enter to keep): ');
    if (ds) cfg.deepseekKey = ds;
    
    const kimi = await prompt('Kimi API key (or Enter to keep): ');
    if (kimi) cfg.kimiKey = kimi;
    
    const model = await prompt('Default model (deepseek/kimi) [deepseek]: ');
    if (model) cfg.defaultModel = model;
    
    saveConfig(cfg);
    console.log('✅ Saved');
  },
  
  help() {
    console.log(`
🦉 Athelgard CLI — Professional GitHub + AI Coding Agent

USAGE:
  athelgard <command> [args]

COMMANDS:
  github login              Authenticate with GitHub (PAT)
  github status             Check GitHub auth status
  github logout             Remove GitHub token
  github repos              List your repositories

  repo <owner/repo>         List repo contents
  repo <owner/repo> cat <file>   Read file contents
  repo <owner/repo> tree    Show full file tree

  chat [model]              Start AI chat (deepseek/kimi)

  config                    Set API keys

EXAMPLES:
  athelgard github login
  athelgard github repos
  athelgard repo NyxSpecter4/bountywarz ls
  athelgard repo NyxSpecter4/bountywarz cat README.md
  athelgard chat
`);
  }
};

// ===== PROMPT HELPER =====
function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    });
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
