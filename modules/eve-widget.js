/**
 * EVE WIDGET — Real-time Agent Dashboard
 * Embedded in Athelgard Web IDE
 */

(function() {
  'use strict';

  // ─── STATE ───
  let eveState = {
    running: false,
    tasks: { pending: 0, completed: 0, failed: 0, total: 0, recent: [] },
    memory: { conversations: 0, facts: 0, files: 0 },
    config: { hasDeepSeek: false, hasKimi: false, hasGitHub: false },
    lastUpdate: null,
    provider: 'none'
  };

  let pollInterval = null;
  let selectedTaskId = null;

  // ─── DOM HELPERS ───
  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return document.querySelectorAll(sel); }
  function ce(tag, cls, html) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (html) el.innerHTML = html;
    return el;
  }

  // ─── STYLES ───
  const WIDGET_CSS = `
    .eve-widget{padding:20px;height:100%;overflow-y:auto;box-sizing:border-box}
    .eve-header{display:flex;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid var(--border)}
    .eve-header h2{margin:0;color:var(--cyan);font-size:20px;display:flex;align-items:center;gap:8px}
    .eve-badge{padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px}
    .eve-badge.online{background:rgba(61,255,154,0.15);color:var(--green);border:1px solid var(--green)}
    .eve-badge.offline{background:rgba(255,59,92,0.15);color:var(--red);border:1px solid var(--red)}
    .eve-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-bottom:24px}
    .eve-card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:16px}
    .eve-card h3{margin:0 0 12px;font-size:14px;color:var(--gold);text-transform:uppercase;letter-spacing:1px;display:flex;align-items:center;gap:6px}
    .eve-stat{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)}
    .eve-stat:last-child{border-bottom:none}
    .eve-stat-label{color:#888;font-size:13px}
    .eve-stat-value{font-weight:700;font-size:14px}
    .eve-stat-value.green{color:var(--green)}
    .eve-stat-value.red{color:var(--red)}
    .eve-stat-value.cyan{color:var(--cyan)}
    .eve-stat-value.gold{color:var(--gold)}
    .eve-bar-bg{height:6px;background:rgba(255,255,255,0.05);border-radius:3px;margin-top:4px;overflow:hidden}
    .eve-bar-fill{height:100%;border-radius:3px;transition:width 0.3s}
    .eve-bar-fill.green{background:var(--green)}
    .eve-bar-fill.gold{background:var(--gold)}
    .eve-bar-fill.red{background:var(--red)}
    .eve-task-list{max-height:300px;overflow-y:auto}
    .eve-task-item{padding:10px 12px;border-radius:8px;margin-bottom:6px;background:rgba(255,255,255,0.02);border:1px solid var(--border);cursor:pointer;transition:all 0.15s;font-size:13px}
    .eve-task-item:hover{background:rgba(18,224,255,0.05);border-color:var(--cyan)}
    .eve-task-item.selected{background:rgba(18,224,255,0.1);border-color:var(--cyan)}
    .eve-task-item .task-status{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:8px}
    .eve-task-item .task-status.pending{background:var(--gold)}
    .eve-task-item .task-status.running{background:var(--cyan);animation:pulse 1s infinite}
    .eve-task-item .task-status.completed{background:var(--green)}
    .eve-task-item .task-status.failed{background:var(--red)}
    .eve-task-item .task-time{color:#666;font-size:11px;float:right}
    .eve-task-desc{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block}
    .eve-input-area{display:flex;gap:10px;margin-top:16px}
    .eve-input{flex:1;background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:10px 14px;color:var(--text);font-size:13px;outline:none}
    .eve-input:focus{border-color:var(--cyan)}
    .eve-btn{background:var(--cyan);border:none;border-radius:10px;padding:10px 18px;color:#000;font-weight:700;cursor:pointer;font-size:13px}
    .eve-btn:hover{background:#0ec8e0}
    .eve-btn.secondary{background:var(--bg);border:1px solid var(--border);color:var(--text)}
    .eve-btn.secondary:hover{background:rgba(18,224,255,0.1)}
    .eve-memory-list{max-height:200px;overflow-y:auto;font-size:12px}
    .eve-memory-item{padding:6px 0;border-bottom:1px solid var(--border);color:#aaa}
    .eve-memory-item:last-child{border-bottom:none}
    .eve-memory-key{color:var(--cyan);font-weight:600}
    .eve-refresh-btn{margin-left:auto;background:transparent;border:1px solid var(--border);color:var(--text);padding:6px 12px;border-radius:8px;cursor:pointer;font-size:12px}
    .eve-refresh-btn:hover{border-color:var(--cyan);color:var(--cyan)}
    .eve-refresh-btn.spinning{animation:spin 0.5s linear}
    .eve-detail{background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:12px;margin-top:8px;font-size:12px}
    .eve-detail pre{margin:0;white-space:pre-wrap;word-break:break-all;font-size:11px;color:#aaa}
    .eve-empty{text-align:center;padding:40px;color:#666;font-size:14px}
    .eve-log{font-family:monospace;font-size:11px;line-height:1.6;color:#888;max-height:200px;overflow-y:auto;background:#000;padding:12px;border-radius:8px}
    .eve-log .log-time{color:#555}
    .eve-log .log-info{color:var(--cyan)}
    .eve-log .log-success{color:var(--green)}
    .eve-log .log-error{color:var(--red)}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
    @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
  `;

  // ─── RENDER ───
  function renderWidget(container) {
    container.innerHTML = '';

    const widget = ce('div', 'eve-widget');
    widget.innerHTML = `
      <div class="eve-header">
        <div style="white-space:pre;font-family:monospace;line-height:1.1;color:var(--cyan);font-size:10px;margin-right:12px">                    ___  ___
                 .-'   ''   '-.
               .'    .-""-.    '.
              /     /      \     \
             |     |  o  o  |     |
             |      \  \/\/  /      |
              \      '-....-'      /
               '.    _|""|_    .'
                 '-.'  ||  '.-'
                     ' || '</div>
        <div>
          <h2>EVE Agent</h2>
          <div style="font-size:11px;color:#888">Athelgard's Owl Guardian</div>
        </div>
        <span class="eve-badge ${eveState.running ? 'online' : 'offline'}">${eveState.running ? '● Online' : '○ Offline'}</span>
        <span class="eve-badge ${eveState.config.hasDeepSeek || eveState.config.hasKimi ? 'online' : 'offline'}" style="margin-left:-8px">
          ${eveState.provider === 'deepseek' ? '🔵 DeepSeek' : eveState.provider === 'kimi' ? '🟣 Kimi' : '⚪ No AI'}
        </span>
        <button class="eve-refresh-btn" onclick="EVE_WIDGET.refresh()" title="Refresh">🔄 Refresh</button>
      </div>

      <div class="eve-grid">
        <!-- Status Card -->
        <div class="eve-card">
          <h3>📊 Status</h3>
          <div class="eve-stat">
            <span class="eve-stat-label">Agent State</span>
            <span class="eve-stat-value ${eveState.running ? 'green' : 'red'}">${eveState.running ? 'Running' : 'Stopped'}</span>
          </div>
          <div class="eve-stat">
            <span class="eve-stat-label">DeepSeek Key</span>
            <span class="eve-stat-value ${eveState.config.hasDeepSeek ? 'green' : 'red'}">${eveState.config.hasDeepSeek ? '✓ Configured' : '✗ Missing'}</span>
          </div>
          <div class="eve-stat">
            <span class="eve-stat-label">Kimi Key</span>
            <span class="eve-stat-value ${eveState.config.hasKimi ? 'green' : 'red'}">${eveState.config.hasKimi ? '✓ Configured' : '✗ Missing'}</span>
          </div>
          <div class="eve-stat">
            <span class="eve-stat-label">GitHub Token</span>
            <span class="eve-stat-value ${eveState.config.hasGitHub ? 'green' : 'gold'}">${eveState.config.hasGitHub ? '✓ Connected' : 'Optional'}</span>
          </div>
          <div class="eve-stat">
            <span class="eve-stat-label">Peak Protection</span>
            <span class="eve-stat-value cyan" id="eve-peak">Checking...</span>
          </div>
          <div class="eve-stat">
            <span class="eve-stat-label">Last Update</span>
            <span class="eve-stat-value" id="eve-last-update">--</span>
          </div>
        </div>

        <!-- Tasks Card -->
        <div class="eve-card">
          <h3>📋 Tasks</h3>
          <div class="eve-stat">
            <span class="eve-stat-label">Pending</span>
            <span class="eve-stat-value gold">${eveState.tasks.pending}</span>
          </div>
          <div class="eve-bar-bg"><div class="eve-bar-fill gold" style="width:${Math.min((eveState.tasks.pending / Math.max(eveState.tasks.total, 1)) * 100, 100)}%"></div></div>
          <div class="eve-stat" style="margin-top:8px">
            <span class="eve-stat-label">Completed</span>
            <span class="eve-stat-value green">${eveState.tasks.completed}</span>
          </div>
          <div class="eve-bar-bg"><div class="eve-bar-fill green" style="width:${Math.min((eveState.tasks.completed / Math.max(eveState.tasks.total, 1)) * 100, 100)}%"></div></div>
          <div class="eve-stat" style="margin-top:8px">
            <span class="eve-stat-label">Failed</span>
            <span class="eve-stat-value red">${eveState.tasks.failed}</span>
          </div>
          <div class="eve-bar-bg"><div class="eve-bar-fill red" style="width:${Math.min((eveState.tasks.failed / Math.max(eveState.tasks.total, 1)) * 100, 100)}%"></div></div>
          <div class="eve-stat" style="margin-top:8px">
            <span class="eve-stat-label">Total</span>
            <span class="eve-stat-value">${eveState.tasks.total}</span>
          </div>
        </div>

        <!-- Memory Card -->
        <div class="eve-card">
          <h3>🧠 Memory</h3>
          <div class="eve-stat">
            <span class="eve-stat-label">Conversations</span>
            <span class="eve-stat-value cyan">${eveState.memory.conversations}</span>
          </div>
          <div class="eve-stat">
            <span class="eve-stat-label">Facts</span>
            <span class="eve-stat-value gold">${eveState.memory.facts}</span>
          </div>
          <div class="eve-stat">
            <span class="eve-stat-label">Files Tracked</span>
            <span class="eve-stat-value green">${eveState.memory.files}</span>
          </div>
          <div class="eve-memory-list" id="eve-memory-preview">
            <div class="eve-empty">No facts stored yet</div>
          </div>
        </div>
      </div>

      <!-- Task Queue -->
      <div class="eve-card" style="margin-bottom:16px">
        <h3>📝 Task Queue</h3>
        <div class="eve-task-list" id="eve-task-list">
          ${renderTaskList()}
        </div>
        <div id="eve-task-detail"></div>
      </div>

      <!-- Assign Task -->
      <div class="eve-card">
        <h3>🚀 Assign Task</h3>
        <div class="eve-input-area">
          <input type="text" class="eve-input" id="eve-task-input" placeholder="Describe what EVE should do... (e.g., 'Find all TODO comments in src/')" onkeydown="if(event.key==='Enter')EVE_WIDGET.assignTask()">
          <button class="eve-btn" onclick="EVE_WIDGET.assignTask()">Assign</button>
        </div>
        <div id="eve-assign-result" style="margin-top:12px;font-size:13px"></div>
      </div>

      <!-- Live Log -->
      <div class="eve-card" style="margin-top:16px">
        <h3>📡 Live Log</h3>
        <div class="eve-log" id="eve-log">
          <div><span class="log-time">[${timeNow()}]</span> <span class="log-info">Widget loaded. Polling every 5s.</span></div>
        </div>
      </div>
    `;

    container.appendChild(widget);
    updatePeakStatus();
    document.getElementById('eve-last-update').textContent = eveState.lastUpdate ? new Date(eveState.lastUpdate).toLocaleTimeString() : '--';
  }

  function renderTaskList() {
    if (!eveState.tasks.recent || eveState.tasks.recent.length === 0) {
      return '<div class="eve-empty">No tasks yet. Assign one below!</div>';
    }
    return eveState.tasks.recent.slice().reverse().map(t => `
      <div class="eve-task-item ${t.id === selectedTaskId ? 'selected' : ''}" onclick="EVE_WIDGET.selectTask('${t.id}')">
        <span class="task-status ${t.status}"></span>
        <span class="task-desc">${escapeHtml(t.description)}</span>
        <span class="task-time">${t.created ? new Date(t.created).toLocaleTimeString() : ''}</span>
      </div>
    `).join('');
  }

  function renderTaskDetail(task) {
    if (!task) return '';
    return `
      <div class="eve-detail">
        <strong style="color:var(--cyan)">Task: ${escapeHtml(task.description)}</strong><br>
        <span style="color:#888">Status:</span> <span class="${task.status === 'completed' ? 'green' : task.status === 'failed' ? 'red' : 'gold'}">${task.status.toUpperCase()}</span><br>
        <span style="color:#888">ID:</span> ${task.id}<br>
        <span style="color:#888">Created:</span> ${task.created ? new Date(task.created).toLocaleString() : '--'}<br>
        ${task.completed ? `<span style="color:#888">Completed:</span> ${new Date(task.completed).toLocaleString()}<br>` : ''}
        ${task.result ? `<span style="color:#888">Result:</span><pre>${escapeHtml(JSON.stringify(task.result, null, 2))}</pre>` : ''}
      </div>
    `;
  }

  // ─── API CALLS ───
  async function fetchStatus() {
    try {
      // Try to read from local files since EVE stores state in ~/.athelgard-*
      // In a real deployment, this would be an API endpoint
      const res = await fetch('/api/eve/status').catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        updateState(data);
        return;
      }
      // Fallback: simulate from what we know
      simulateState();
    } catch (e) {
      log('error', 'Failed to fetch status: ' + e.message);
    }
  }

  async function assignTask(description) {
    try {
      log('info', `Assigning task: ${description}`);
      const res = await fetch('/api/eve/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        log('success', `Task assigned: ${data.id}`);
        return data;
      }

      // Fallback: store locally and simulate
      const task = {
        id: Date.now().toString(36),
        description,
        status: 'pending',
        created: new Date().toISOString(),
        result: null
      };
      eveState.tasks.recent.push(task);
      eveState.tasks.pending++;
      eveState.tasks.total++;
      log('success', `Task queued locally: ${task.id}`);
      refresh();
      return task;
    } catch (e) {
      log('error', 'Failed to assign task: ' + e.message);
    }
  }

  function updateState(data) {
    eveState = { ...eveState, ...data, lastUpdate: Date.now() };
    refresh();
  }

  function simulateState() {
    // Read from localStorage if available
    try {
      const saved = localStorage.getItem('eve-widget-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        eveState = { ...eveState, ...parsed };
      }
    } catch {}
    eveState.lastUpdate = Date.now();
  }

  function saveState() {
    try {
      localStorage.setItem('eve-widget-state', JSON.stringify(eveState));
    } catch {}
  }

  // ─── PEAK PROTECTION ───
  function updatePeakStatus() {
    const bjHour = new Date().toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: 'Asia/Shanghai' });
    const isPeak = (bjHour >= 9 && bjHour < 12) || (bjHour >= 14 && bjHour < 18);
    const el = document.getElementById('eve-peak');
    if (el) {
      el.textContent = isPeak ? '🔴 Peak (Kimi active)' : '🟢 Off-peak (DeepSeek)';
      el.className = 'eve-stat-value ' + (isPeak ? 'gold' : 'green');
    }
  }

  // ─── LOGGING ───
  function log(level, message) {
    const logEl = document.getElementById('eve-log');
    if (!logEl) return;
    const line = ce('div');
    line.innerHTML = `<span class="log-time">[${timeNow()}]</span> <span class="log-${level}">${escapeHtml(message)}</span>`;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function timeNow() {
    return new Date().toLocaleTimeString('en-US', { hour12: false });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ─── PUBLIC API ───
  window.EVE_WIDGET = {
    init(containerId) {
      const container = document.getElementById(containerId);
      if (!container) { console.error('EVE_WIDGET: Container not found:', containerId); return; }

      // Inject styles
      if (!document.getElementById('eve-widget-styles')) {
        const style = ce('style', '', WIDGET_CSS);
        style.id = 'eve-widget-styles';
        document.head.appendChild(style);
      }

      renderWidget(container);
      this.refresh();

      // Start polling
      if (pollInterval) clearInterval(pollInterval);
      pollInterval = setInterval(() => this.refresh(), 5000);

      log('success', 'EVE Widget initialized');
    },

    async refresh() {
      const btn = document.querySelector('.eve-refresh-btn');
      if (btn) btn.classList.add('spinning');
      await fetchStatus();
      renderWidget(document.getElementById('eve-widget-container') || document.querySelector('.eve-widget').parentElement);
      if (btn) btn.classList.remove('spinning');
      updatePeakStatus();
      saveState();
    },

    async assignTask() {
      const input = document.getElementById('eve-task-input');
      const resultEl = document.getElementById('eve-assign-result');
      if (!input || !input.value.trim()) return;

      const desc = input.value.trim();
      input.value = '';
      resultEl.innerHTML = '<span style="color:var(--cyan)">⏳ Assigning...</span>';

      const task = await assignTask(desc);
      if (task) {
        resultEl.innerHTML = `<span style="color:var(--green)">✓ Task assigned! ID: ${task.id}</span>`;
      } else {
        resultEl.innerHTML = `<span style="color:var(--red)">✗ Failed to assign task</span>`;
      }

      setTimeout(() => { resultEl.innerHTML = ''; }, 5000);
    },

    selectTask(id) {
      selectedTaskId = id;
      const task = eveState.tasks.recent.find(t => t.id === id);
      const detailEl = document.getElementById('eve-task-detail');
      if (detailEl && task) {
        detailEl.innerHTML = renderTaskDetail(task);
      }
      // Re-render to update selection highlight
      const listEl = document.getElementById('eve-task-list');
      if (listEl) listEl.innerHTML = renderTaskList();
    },

    destroy() {
      if (pollInterval) clearInterval(pollInterval);
      pollInterval = null;
    },

    // Allow external updates (from parent app)
    update(data) {
      updateState(data);
    }
  };

})();
