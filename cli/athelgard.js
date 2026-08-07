#!/usr/bin/env node
/**
 * ATHELGARD CLI v3 — Simplified. Clean. Works.
 * 
 * Install: npm link
 * Usage:  athelgard "your question"
 *         athelgard -c    (chat mode)
 *         athelgard -s    (status)
 * 
 * That's it. No clutter.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const readline = require('readline');

const CONFIG_PATH = path.join(require('os').homedir(), '.athelgard.json');

// ======== ATHELGARD LOGO: white owl face on dark circle ========
const OWL = `
\x1b[40m     /\\_/\\     \x1b[0m
\x1b[40m    ( o   o )    \x1b[0m
\x1b[40m     (  >  )     \x1b[0m
\x1b[40m      \\_-_/      \x1b[0m
`;

const SIGNATURES = [
  "— Fly safe.",
  "— Eyes sharp.",
  "— Nest secure.",
  "— Wings steady."
];

// ======== CONFIG ========
function loadConfig() {
  try { return JSON.parse(fs.readFileSync(CONFIG_PATH)); } 
  catch { return {}; }
}

function saveConfig(c) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(c, null, 2));
}

// ======== AI ========
function isPeak() {
  const h = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', hour12: false });
  return h >= 9 && h < 21;
}

function getProvider(config) {
  if (isPeak() && config.kimi) return { name: 'Kimi', key: config.kimi, host: 'api.moonshot.cn', model: 'kimi-k2p6' };
  if (config.deepseek) return { name: 'DeepSeek', key: config.deepseek, host: 'api.deepseek.com', model: 'deepseek-chat' };
  return null;
}

async function askAI(messages, provider) {
  const data = JSON.stringify({ model: provider.model, messages, temperature: 0.7, max_tokens: 4000 });
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: provider.host, path: '/v1/chat/completions', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${provider.key}`, 'Content-Length': Buffer.byteLength(data) }
    }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try { 
          const j = JSON.parse(body);
          if (j.error) reject(new Error(j.error.message));
          else resolve(j.choices?.[0]?.message?.content || '...');
        } catch { reject(new Error('Bad response')); }
      });
    });
    req.on('error', reject);
    req.write(data); req.end();
  });
}

const SYSTEM = `You are Athelgard, owl wingmate from BountyWarz. Ethical bounty hunting mentor.
Rules: scope-first, simulation-only, evidence scoring (observation/impact/reproduction/remediation).
Tone: sharp, protective, brief. Use flight metaphors. No markdown tables.`;

async function ask(prompt, context = '') {
  const config = loadConfig();
  const p = getProvider(config);
  if (!p) throw new Error('No API key. Run: athelgard --config');
  
  const messages = [
    { role: 'system', content: SYSTEM + (context ? '\n' + context : '') },
    { role: 'user', content: prompt }
  ];
  
  return askAI(messages, p);
}

// ======== COMMANDS ========
async function showHelp() {
  console.log(OWL);
  console.log(`
Usage:
  athelgard "your question"     Ask anything
  athelgard -c, --chat          Chat mode
  athelgard -s, --status        Check AI status
  athelgard --config            Set API keys
  athelgard -h, --help          This help

What makes Athelgard different:
  vs Aider:      Aider pairs on code. Athelgard teaches ethics FIRST.
  vs Claude:     Claude is general. Athelgard is scope-first bounty mentor.
  vs Grok:       Grok is broad. Athelgard scores evidence (0-100).
  vs Hermes:     Hermes automates. Athelgard guards boundaries.

Athelgard = ethics + scoring + personality. Not code generation.`);
}

async function chatMode() {
  const config = loadConfig();
  const p = getProvider(config);
  if (!p) { console.log('Run: athelgard --config'); return; }
  
  console.log(OWL);
  console.log(`\n🦉 Athelgard | ${p.name} | type 'exit' to quit\n`);
  
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const history = [];
  
  const loop = () => rl.question('> ', async input => {
    if (input === 'exit') { console.log(SIGNATURES[Math.random()*4|0]); rl.close(); return; }
    
    history.push({ role: 'user', content: input });
    try {
      const r = await askAI([{ role: 'system', content: SYSTEM }, ...history.slice(-6)], p);
      history.push({ role: 'assistant', content: r });
      console.log('\n' + r + '\n');
    } catch(e) { console.log('Error:', e.message); }
    loop();
  });
  loop();
}

async function showStatus() {
  const c = loadConfig();
  const p = getProvider(c);
  console.log(OWL);
  console.log(`\nAI:      ${p?.name || 'NOT SET'}`);
  console.log(`Peak:    ${isPeak() ? 'YES (Kimi fallback)' : 'NO (DeepSeek)'}`);
  console.log(`Config:  ${CONFIG_PATH}\n`);
}

async function doConfig() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = q => new Promise(r => rl.question(q, a => r(a.trim())));
  
  const c = loadConfig();
  console.log(OWL);
  console.log('\n🦉 Setup\n');
  
  c.deepseek = await ask('DeepSeek key: ') || c.deepseek;
  c.kimi = await ask('Kimi key (optional): ') || c.kimi;
  
  saveConfig(c);
  rl.close();
  console.log('\n✅ Saved. ' + SIGNATURES[Math.random()*4|0]);
}

// ======== MAIN ========
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '-h' || args[0] === '--help') {
    await showHelp();
    return;
  }
  
  if (args[0] === '--config') { await doConfig(); return; }
  if (args[0] === '-s' || args[0] === '--status') { await showStatus(); return; }
  if (args[0] === '-c' || args[0] === '--chat') { await chatMode(); return; }
  
  // Default: single question
  const prompt = args.join(' ');
  console.log(OWL);
  console.log('\n🦉 Thinking...\n');
  
  try {
    const answer = await ask(prompt);
    console.log(answer);
    console.log('\n' + SIGNATURES[Math.random()*4|0]);
  } catch (e) {
    console.log('Error:', e.message);
    console.log('Run: athelgard --config');
  }
}

main().catch(e => console.error(e.message));
