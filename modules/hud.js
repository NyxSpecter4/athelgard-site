// modules/hud.js — In-game HUD overlay for Athelgard
// Drop this into bountywarz/src/ui/

export class AthelgardHUD {
  constructor(container) {
    this.container = container || document.body;
    this.visible = false;
    this.messages = [];
    this.createElements();
  }

  createElements() {
    // Main chat overlay
    this.el = document.createElement('div');
    this.el.id = 'athelgard-hud';
    this.el.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 380px;
      max-height: 500px;
      background: rgba(10, 10, 15, 0.95);
      border: 1px solid #1a1a2e;
      border-radius: 16px;
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 1000;
      backdrop-filter: blur(10px);
      font-family: 'Segoe UI', system-ui, sans-serif;
    `;

    // Header with owl avatar
    this.el.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px; padding:12px 16px; border-bottom:1px solid #1a1a2e; background:rgba(18,18,26,0.8);">
        <div style="width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#12e0ff,#a855f7); display:flex; align-items:center; justify-content:center; font-size:20px;">🦉</div>
        <div style="flex:1;">
          <div style="font-weight:700; color:#12e0ff; font-size:14px;">Athelgard</div>
          <div style="font-size:11px; color:#888;">AI Wingmate</div>
        </div>
        <button id="athelgard-minimize" style="background:none; border:none; color:#888; cursor:pointer; font-size:18px;">−</button>
      </div>
      <div id="athelgard-messages" style="flex:1; overflow-y:auto; padding:12px; display:flex; flex-direction:column; gap:8px; max-height:350px;"></div>
      <div style="display:flex; gap:8px; padding:12px; border-top:1px solid #1a1a2e;">
        <button id="athelgard-voice" style="background:#1a1a2e; border:none; border-radius:10px; width:36px; height:36px; color:#e0e0e0; cursor:pointer; font-size:16px;">🎤</button>
        <input id="athelgard-input" type="text" placeholder="Message Athelgard..." style="flex:1; background:#1a1a2e; border:1px solid #2a2a3e; border-radius:10px; padding:8px 12px; color:#e0e0e0; outline:none;">
        <button id="athelgard-send" style="background:linear-gradient(135deg,#12e0ff,#a855f7); border:none; border-radius:10px; width:36px; height:36px; color:#000; font-weight:bold; cursor:pointer;">➤</button>
      </div>
    `;

    this.container.appendChild(this.el);

    // Event listeners
    this.el.querySelector('#athelgard-minimize').addEventListener('click', () => this.hide());
    this.el.querySelector('#athelgard-send').addEventListener('click', () => this.sendMessage());
    this.el.querySelector('#athelgard-input').addEventListener('keydown', e => {
      if (e.key === 'Enter') this.sendMessage();
    });

    // Minimized indicator
    this.indicator = document.createElement('div');
    this.indicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #12e0ff, #a855f7);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      cursor: pointer;
      z-index: 1000;
      box-shadow: 0 4px 20px rgba(18, 224, 255, 0.3);
      transition: transform 0.2s;
    `;
    this.indicator.textContent = '🦉';
    this.indicator.addEventListener('click', () => this.show());
    this.indicator.addEventListener('mouseenter', () => this.indicator.style.transform = 'scale(1.1)');
    this.indicator.addEventListener('mouseleave', () => this.indicator.style.transform = 'scale(1)');
    this.container.appendChild(this.indicator);

    this.messagesEl = this.el.querySelector('#athelgard-messages');
  }

  show() {
    this.visible = true;
    this.el.style.display = 'flex';
    this.indicator.style.display = 'none';
  }

  hide() {
    this.visible = false;
    this.el.style.display = 'none';
    this.indicator.style.display = 'flex';
  }

  toggle() {
    this.visible ? this.hide() : this.show();
  }

  addMessage(role, text) {
    const msg = document.createElement('div');
    const isUser = role === 'user';
    msg.style.cssText = `
      align-self: ${isUser ? 'flex-end' : 'flex-start'};
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 13px;
      line-height: 1.4;
      background: ${isUser ? '#12e0ff' : '#1a1a2e'};
      color: ${isUser ? '#000' : '#e0e0e0'};
      border: ${isUser ? 'none' : '1px solid #2a2a3e'};
    `;
    msg.textContent = text;
    this.messagesEl.appendChild(msg);
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  }

  sendMessage() {
    const input = this.el.querySelector('#athelgard-input');
    const text = input.value.trim();
    if (!text) return;
    this.addMessage('user', text);
    input.value = '';
    // This triggers the companion's receiveCommand
    if (this.onMessage) this.onMessage(text);
  }

  // Quick speech bubble (for contextual alerts)
  showBubble(text, duration = 4000) {
    const bubble = document.createElement('div');
    bubble.style.cssText = `
      position: fixed;
      bottom: 90px;
      right: 20px;
      background: rgba(18, 18, 26, 0.95);
      border: 1px solid #12e0ff;
      border-radius: 16px;
      padding: 12px 16px;
      color: #e0e0e0;
      font-size: 13px;
      max-width: 320px;
      z-index: 1001;
      animation: slideIn 0.3s ease;
      backdrop-filter: blur(10px);
    `;
    bubble.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
        <span style="font-size:16px;">🦉</span>
        <span style="font-weight:700; color:#12e0ff; font-size:12px;">Athelgard</span>
      </div>
      <div>${text}</div>
    `;
    this.container.appendChild(bubble);
    setTimeout(() => bubble.remove(), duration);
  }

  // Bind key (e.g., 'T' for talk)
  bindKey(keyCode) {
    document.addEventListener('keydown', e => {
      if (e.code === keyCode && !e.repeat) {
        e.preventDefault();
        this.toggle();
      }
    });
  }
}

// Animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;
document.head.appendChild(style);
