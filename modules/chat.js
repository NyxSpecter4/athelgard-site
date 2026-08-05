// modules/chat.js — AI Chat Engine with fallback
import { CONFIG } from './config.js';
import { CostRouter } from './brain.js';
import { getGitHubConnection } from './github.js';

const router = new CostRouter();

export async function sendChatMessage(text) {
  const route = router.selectModel('deepseek', CONFIG);
  try {
    if (route.model === 'deepseek' && CONFIG.deepseekKey) return await callDeepSeek(text);
    if (route.model === 'kimi' && CONFIG.kimiKey) return await callKimi(text);
    if (CONFIG.deepseekKey) return await callDeepSeek(text);
    if (CONFIG.kimiKey) return await callKimi(text);
    throw new Error('No API keys configured. Add keys in Settings.');
  } catch (error) {
    console.error('[Athelgard] Chat error:', error);
    throw error;
  }
}

async function callDeepSeek(text) {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${CONFIG.deepseekKey}` },
    body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'system', content: 'You are Athelgard, a concise AI coding mentor. Help with code, explain concepts, and guide users.' }, { role: 'user', content: text }], max_tokens: 2000, temperature: 0.7 }),
  });
  if (!response.ok) throw new Error(`DeepSeek ${response.status}: ${await response.text()}`);
  const data = await response.json();
  return { text: data.choices?.[0]?.message?.content || 'No response', model: 'DeepSeek', cost: data.usage ? `$${((data.usage.total_tokens || 0) * 0.000002).toFixed(4)}` : 'unknown' };
}

async function callKimi(text) {
  const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${CONFIG.kimiKey}` },
    body: JSON.stringify({ model: 'kimi-k2p6', messages: [{ role: 'system', content: 'You are Athelgard, a concise AI coding mentor.' }, { role: 'user', content: text }], max_tokens: 2000, temperature: 0.7 }),
  });
  if (!response.ok) throw new Error(`Kimi ${response.status}: ${await response.text()}`);
  const data = await response.json();
  return { text: data.choices?.[0]?.message?.content || 'No response', model: 'Kimi', cost: 'unknown' };
}

async function checkModel(url, key, body) {
  try {
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key || 'test'}` }, body: JSON.stringify(body) });
    return response.status === 401 ? 'key_needed' : response.ok ? 'ok' : `error_${response.status}`;
  } catch { return 'offline'; }
}

export async function checkAPIHealth() {
  const [deepseek, kimi, github] = await Promise.all([
    checkModel('https://api.deepseek.com/chat/completions', CONFIG.deepseekKey, { model: 'deepseek-chat', messages: [{ role: 'user', content: 'hi' }], max_tokens: 1 }),
    checkModel('https://api.moonshot.cn/v1/chat/completions', CONFIG.kimiKey, { model: 'kimi-k2p6', messages: [{ role: 'user', content: 'hi' }], max_tokens: 1 }),
    getGitHubConnection().then(() => 'ok').catch(error => error.message.includes('not connected') ? 'token_needed' : 'offline'),
  ]);
  return { deepseek, kimi, github };
}
