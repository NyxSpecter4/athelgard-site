#!/usr/bin/env node
/**
 * ATHELGARD CLI v2.0 — Captain's Wingmate
 * 
 * Install globally:
 *   npm link                    # From this directory
 *   # OR
 *   chmod +x athelgard.js
 *   sudo ln -s $(pwd)/athelgard.js /usr/local/bin/athelgard
 * 
 * Usage:
 *   athelgard ask "How do I write a React hook?"
 *   athelgard chat              # Interactive mode with owl personality
 *   athelgard config            # Set up API keys
 *   athelgard status            # Check which AI is active
 *   athelgard help              # Show all commands
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const readline = require('readline');
const { execSync } = require('child_process');

const CONFIG_PATH = path.join(require('os').homedir(), '.athelgard.json');

// ======== ATHELGARD PERSONALITY ========
const OWL_ASCII = `
    ___  ___________  _________   ________________  ____  _____
   /   |/_  __/ __ \\/ ____/   | / ____/ ____/ __ \\/ __ \\/ ___/
  / /| | / / / / / / __/ / /| |/ / __/ __/ / /_/ / / / /\__ \
 / ___ |/ / / /_/ / /___/ ___ / /_/ / /___/ _, _/ /_/ /___/ /
/_/  |_/_/ /_____/_____/_/  |_\\____/_____/_/ |_|/_____//____/
                                                              
         .---.
        /   o o\\
       |   <    |
        \\  -  /
         '---'
      A T H E L G A R D
      Your Ethical Wingmate
`;

const FLIGHT_METAPHORS = [
  "Clear skies ahead, hunter.",
  "Fly safe out there.",
  "Wings steady, aim true.",
  "The nest is secure. Go hunt.",
  "Tailwinds favor the prepared.",
  "Eyes sharp, hunter. Eyes sharp.",
  "From the nest to the skies — we move."
];

const GREETINGS = [
  "🦉 Hoot! Athelgard online. What's our mission?",
  "🦉 Wings spread, systems green. What are we hunting?",
  "🦉 The owl sees all. What's your target?",
  "🦉 Athelgard reporting for duty. Scope card ready?"
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function typewrite(text, speed = 15) {
  return new Promise(resolve => {
    let i = 0;
    const interval = setInterval(() => {
      process.stdout.write(text[i]);
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        process.stdout.write('\n');
        resolve();
      }
    }, speed);
  });
}

function printOwl() {
  console.log('\x1b[36m' + OWL_ASCII + '\x1b[0m');
}

// ======== CONFIG ========
function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

// ======== AI CALLERS ========
function isPeakHours() {
  const now = new Date();
  const pst = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  return pst.getHours() >= 9 && pst.getHours() < 21;
}

function getActiveProvider(config) {
  const peak = isPeakHours();
  if (peak && config.kimiKey) return { name: 'Kimi', key: config.kimiKey, host: 'api.moonshot.cn', path: '/v1/chat/completions', model: 'kimi-k2p6' };
  if (config.deepseekKey) return { name: 'DeepSeek', key: config.deepseekKey, host: 'api.deepseek.com', path: '/v1/chat/completions', model: 'deepseek-chat' };
  return null;
}

async function callAI(messages, provider) {
  const data = JSON.stringify({
    model: provider.model,
    messages,
    temperature: 0.7,
    max_tokens: 4000,
    stream: false
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: provider.host,
      path: provider.path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.key}`,
        'Content-Length': Buffer.byteLength(data)
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.error) reject(new Error(json.error.message));
          else resolve(json.choices?.[0]?.message?.content || 'No response');
        } catch (e) {
          reject(new Error('Invalid response: ' + body.substring(0, 100)));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// ======== ATHELGARD SYSTEM PROMPT ========
function getSystemPrompt() {
  return `You are Athelgard, the owl wingmate from BountyWarz — an ethical bounty hunting training platform.

PERSONALITY:
- Protective, sharp, uses gaming terminology (Functors, Genomes, Glyph, exploits, scans, captures)
- You mentor ethical bounty hunters in simulated cyber-tactical worlds
- Score findings on evidence quality: observation, impact, reproduction, remediation
- NEVER help with real unauthorized targets — training simulation only
- Encouraging but firm on boundaries
- Sign off with flight metaphors when appropriate
- In bash/terminal mode, keep responses concise but punchy

RESPONSE RULES:
- Be concise but thorough
- Use bounty hunting game terms naturally
- If user mentions a finding, ask: "Is this simulated? What's your scope card?"
- Guide through: scope → asset → evidence → impact → report → remediation
- Terminal-friendly: avoid markdown tables, use ASCII bullets
- Keep code blocks clean and copy-pasteable`;
}

async function askAthelgard(prompt, context = '') {
  const config = loadConfig();
  const provider = getActiveProvider(config);
  
  if (!provider) {
    throw new Error('No API key configured. Run: athelgard config');
  }

  const messages = [
    { role: 'system', content: getSystemPrompt() + (context ? '\n\n' + context : '') },
    { role: 'user', content: prompt }
  ];

  console.log(`\n🦉 Athelgard thinking (${provider.name})...\n`);
  const response = await callAI(messages, provider);
  return response;
}

// ======== COMMANDS ========
const commands = {
  async config() {
    const config = loadConfig();
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ask = q => new Promise(r => rl.question(q, a => r(a.trim())));
    
    console.log('\n🦉 Athelgard Configuration\n');
    config.deepseekKey = await ask('DeepSeek API Key (primary): ') || config.deepseekKey;
    config.kimiKey = await ask('Kimi API Key (fallback during peak): ') || config.kimiKey;
    config.githubToken = await ask('GitHub Token (optional): ') || config.githubToken;
    
    rl.close();
    saveConfig(config);
    console.log('\n✅ Config saved to ~/.athelgard.json');
    console.log(randomFrom(FLIGHT_METAPHORS));
  },

  async ask(question) {
    if (!question) {
      console.log('Usage: athelgard ask "your question"');
      return;
    }
    printOwl();
    const answer = await askAthelgard(question);
    console.log('\n' + '─'.repeat(60));
    console.log(answer);
    console.log('─'.repeat(60));
    console.log('\n' + randomFrom(FLIGHT_METAPHORS));
  },

  async chat() {
    const config = loadConfig();
    const provider = getActiveProvider(config);
    if (!provider) {
      console.log('❌ No API key. Run: athelgard config');
      return;
    }

    printOwl();
    console.log('\n' + randomFrom(GREETINGS));
    console.log('Type "exit" to land. Type "help" for commands.\n');

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const history = [];
    
    const askPrompt = () => {
      rl.question('\x1b[36mYou:\x1b[0m ', async input => {
        if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
          console.log('\n🦉 ' + randomFrom(FLIGHT_METAPHORS));
          rl.close();
          return;
        }
        
        if (input.toLowerCase() === 'help') {
          console.log('\n🦉 Chat Commands:');
          console.log('  scope    - Show current scope requirements');
          console.log('  status   - Show active AI provider');
          console.log('  clear    - Clear conversation history');
          console.log('  exit     - Land the owl\n');
          askPrompt();
          return;
        }

        if (input.toLowerCase() === 'status') {
          const p = getActiveProvider(config);
          console.log(`\n🦉 Active: ${p?.name || 'NONE'} | Peak hours: ${isPeakHours() ? 'YES (using Kimi)' : 'NO (using DeepSeek)'}`);
          askPrompt();
          return;
        }

        if (input.toLowerCase() === 'scope') {
          console.log(`\n🦉 BountyWarz Scope Requirements:`);
          console.log('  1. SIMULATED target only');
          console.log('  2. Authorized program');
          console.log('  3. In-scope target ID');
          console.log('  4. Evidence: observation, impact, reproduction, remediation\n');
          askPrompt();
          return;
        }
        
        try {
          history.push({ role: 'user', content: input });
          const messages = [
            { role: 'system', content: getSystemPrompt() },
            ...history.slice(-10) // Keep last 10 exchanges
          ];
          
          console.log(`\n🦉 Athelgard (${provider.name})...`);
          const answer = await callAI(messages, provider);
          history.push({ role: 'assistant', content: answer });
          
          console.log('\n' + '─'.repeat(60));
          console.log(answer);
          console.log('─'.repeat(60) + '\n');
        } catch (e) {
          console.log('❌ Error:', e.message);
        }
        
        askPrompt();
      });
    };
    
    askPrompt();
  },

  async status() {
    const config = loadConfig();
    const provider = getActiveProvider(config);
    printOwl();
    console.log('\n🦉 Athelgard Status Report');
    console.log('─'.repeat(40));
    console.log(`Active AI:     ${provider?.name || 'NOT CONFIGURED'}`);
    console.log(`Peak Hours:    ${isPeakHours() ? 'YES (9AM-9PM PST)' : 'NO'}`);
    console.log(`Fallback:      ${config.kimiKey ? 'Kimi ready' : 'No fallback'}`);
    console.log(`GitHub Token:  ${config.githubToken ? '✅ Set' : '❌ Not set'}`);
    console.log('─'.repeat(40));
    console.log('\n' + randomFrom(FLIGHT_METAPHORS));
  },

  async install() {
    console.log('\n🦉 Installing Athelgard CLI...\n');
    
    // Check if already installed
    try {
      const which = execSync('which athelgard', { encoding: 'utf8' }).trim();
      console.log(`Athelgard already installed at: ${which}`);
      return;
    } catch {
      // Not installed, continue
    }

    const binPath = path.join(__dirname, 'athelgard.js');
    const globalBin = '/usr/local/bin/athelgard';
    
    try {
      fs.chmodSync(binPath, 0o755);
      execSync(`sudo ln -s ${binPath} ${globalBin}`);
      console.log(`✅ Installed! Type 'athelgard' anywhere.`);
    } catch (e) {
      console.log('❌ Install failed. Try manually:');
      console.log(`   sudo ln -s ${binPath} /usr/local/bin/athelgard`);
    }
    
    console.log('\n' + randomFrom(FLIGHT_METAPHORS));
  },

  help() {
    printOwl();
    console.log(`
🦉 ATHELGARD CLI — Your Ethical Wingmate

Commands:
  athelgard ask "question"      One-shot question
  athelgard chat                Interactive chat with owl personality
  athelgard config              Set up API keys (DeepSeek + Kimi fallback)
  athelgard status              Check active AI and configuration
  athelgard install             Install globally (type 'athelgard' anywhere)
  athelgard help                Show this help

What is Athelgard?
  NOT an IDE — she's a CLI agent that runs in your terminal
  NOT a code editor — she reviews, mentors, and guides
  LIKE Aider but for bounty hunting ethics + evidence scoring
  LIKE Claude Code but with game terminology and scope-first thinking

Key Features:
  🎯 Scope-first ethical gate (simulated targets only)
  📊 Evidence scoring (observation, impact, reproduction, remediation)
  💰 Cost routing (DeepSeek off-peak, Kimi during peak)
  🦉 Owl personality with flight metaphors
  🔗 GitHub integration for repo analysis

Examples:
  athelgard ask "How do I use useEffect?"
  athelgard ask "I found an XSS in the training range"
  athelgard chat
  athelgard config
`);
  }
};

// ======== MAIN ========
async function main() {
  const [,, cmd, ...args] = process.argv;
  
  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
    commands.help();
    return;
  }
  
  if (commands[cmd]) {
    await commands[cmd](args);
  } else {
    // If no command matched, treat as ask
    await commands.ask([cmd, ...args].join(' '));
  }
}

main().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
