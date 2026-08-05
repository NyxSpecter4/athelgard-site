// modules/chat.js — AI Chat Engine with fallback
import { CONFIG } from './config.js';
import { CostRouter } from './brain.js';

const router = new CostRouter();

export async function sendChatMessage(text) {
  const route = router.selectModel('deepseek', CONFIG);
  console.log(`[Athelgard] Routing to ${route.model} (${route.reason})`);

  try {
    if (route.model === 'deepseek' && CONFIG.deepseekKey) {
      return await callDeepSeek(text);
    }
    if (route.model === 'kimi' && CONFIG.kimiKey) {
      return await callKimi(text);
    }
    // Fallback: try whichever has a key
    if (CONFIG.deepseekKey) return await callDeepSeek(text);
    if (CONFIG.kimiKey) return await callKimi(text);
    throw new Error('No API keys configured. Add keys in Settings.');
  } catch (e) {
    console.error('[Athelgard] Chat error:', e);
    throw e;
  }
}

async function callDeepSeek(text) {
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG.deepseekKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are Athelgard, a friendly AI coding mentor. Help with code, explain concepts, and guide users. Be concise and helpful.' },
        { role: 'user', content: text },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepSeek ${res.status}: ${err}`);
  }

  const data = await res.json();
  return {
    text: data.choices?.[0]?.message?.content || 'No response',
    model: 'DeepSeek',
    cost: data.usage ? `$${((data.usage.total_tokens || 0) * 0.000002).toFixed(4)}` : 'unknown',
  };
}

async function callKimi(text) {
  const res = await fetch('https://api.moonshot.cn/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG.kimiKey}`,
    },
    body: JSON.stringify({
      model: 'kimi-k2p6',
      messages: [
        { role: 'system', content: 'You are Athelgard, a friendly AI coding mentor.' },
        { role: 'user', content: text },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Kimi ${res.status}: ${err}`);
  }

  const data = await res.json();
  return {
    text: data.choices?.[0]?.message?.content || 'No response',
    model: 'Kimi',
    cost: 'unknown',
  };
}

// Quick API health check
export async function checkAPIHealth() {
  const results = {};

  // DeepSeek check (lightweight)
  try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${CONFIG.deepseekKey || 'test'}` },
      body: JSON.stringify({ model: 'deepseek-chat', messages: [{role:'user',content:'hi'}], max_tokens: 1 }),
    });
    results.deepseek = res.status === 401 ? 'key_needed' : res.ok ? 'ok' : `error_${res.status}`;
  } catch (e) {
    results.deepseek = 'offline';
  }

  // Kimi check
  try {
    const res = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${CONFIG.kimiKey || 'test'}` },
      body: JSON.stringify({ model: 'kimi-k2p6', messages: [{role:'user',content:'hi'}], max_tokens: 1 }),
    });
    results.kimi = res.status === 401 ? 'key_needed' : res.ok ? 'ok' : `error_${res.status}`;
  } catch (e) {
    results.kimi = 'offline';
  }

  // GitHub check
  try {
    const res = await fetch('https://api.github.com/user', {
      headers: { 'Authorization': `token ${CONFIG.githubToken || 'test'}`, 'User-Agent': 'Athelgard/6.0' },
    });
    results.github = res.status === 401 ? 'token_needed' : res.ok ? 'ok' : `error_${res.status}`;
  } catch (e) {
    results.github = 'offline';
  }

  return results;
}
