// modules/ui.js — UI utilities
export function toast(msg, duration = 3000) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateY(20px);background:#ff3b5c;color:#fff;padding:12px 24px;border-radius:12px;font-size:14px;opacity:0;transition:all 0.3s;z-index:1000;';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  t.style.transform = 'translateX(-50%) translateY(0)';
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(-50%) translateY(20px)';
  }, duration);
}

export function addChatMessage(role, text) {
  const container = document.getElementById('chat-history');
  if (!container) return;
  const msg = document.createElement('div');
  msg.className = `msg ${role}`;
  const avatar = role === 'user' ? '👤' : '🦉';
  const name = role === 'user' ? 'Captain' : 'Athelgard';
  msg.innerHTML = `<div class="msg-header"><span class="msg-avatar">${avatar}</span><span class="msg-name">${name}</span></div><div class="msg-body">${escapeHtml(text).replace(/\n/g, '<br>')}</div>`;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
  return msg;
}

export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function showPanel(id) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById(id);
  if (panel) panel.classList.add('active');
}

export function setLoading(loading) {
  const btn = document.getElementById('send-btn');
  if (btn) btn.textContent = loading ? '⏳' : '➤';
}
