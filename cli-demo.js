#!/usr/bin/env node
// Quick CLI demo
const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.join(require('os').homedir(), '.athelgard');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

console.log('🦉 ATHELGARD CLI DEMO\n');

// Show config
if (fs.existsSync(CONFIG_FILE)) {
  const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  console.log('✅ Config exists');
  console.log('   Provider:', config.provider);
  console.log('   DeepSeek key:', config.deepseekKey ? config.deepseekKey.slice(0,8)+'...' : 'not set');
} else {
  console.log('⚠️  No config — run: node athelgard.js config');
}

console.log('\n📁 CLI Location:');
console.log('   ', path.join(__dirname, 'athelgard.js'));
console.log('\nUsage:');
console.log('   node athelgard.js config    # Set API keys');
console.log('   node athelgard.js github    # Connect GitHub (PAT)');
console.log('   node athelgard.js chat      # Start coding session');
console.log('   node athelgard.js repo <owner/repo> <command>');
