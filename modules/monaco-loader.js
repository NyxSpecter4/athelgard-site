// Monaco Editor Lazy Loader
// Only loads when user switches to Code tab
// Keeps initial page load under 500KB

(function() {
  'use strict';

  let editorInstance = null;
  let isLoading = false;

  window.MonacoLoader = {
    async load(containerId = 'code-editor-container') {
      if (editorInstance) return editorInstance;
      if (isLoading) {
        while (isLoading) {
          await new Promise(r => setTimeout(r, 100));
        }
        return editorInstance;
      }

      isLoading = true;

      try {
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        const isLowPower = document.body.classList.contains('power-save');

        if (isMobile || isLowPower) {
          return this.loadLiteEditor(containerId);
        }

        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js');

        return new Promise((resolve, reject) => {
          require.config({
            paths: {
              vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs'
            }
          });

          require(['vs/editor/editor.main'], () => {
            const container = document.getElementById(containerId);
            if (!container) {
              reject(new Error('Editor container not found'));
              return;
            }

            editorInstance = monaco.editor.create(container, {
              value: '// Athelgard Mobile Editor\n// Start coding...',
              language: 'javascript',
              theme: 'vs-dark',
              automaticLayout: true,
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: 'SF Mono, Monaco, Inconsolata, monospace',
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              readOnly: false,
              cursorStyle: 'line',
              wordWrap: 'on',
              wrappingIndent: 'indent'
            });

            isLoading = false;
            resolve(editorInstance);
          });
        });
      } catch (err) {
        isLoading = false;
        console.error('[MonacoLoader] Failed:', err);
        return this.loadLiteEditor(containerId);
      }
    },

    loadLiteEditor(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return null;

      container.innerHTML = `
        <div style="height:100%;display:flex;flex-direction:column;">
          <div style="padding:8px 12px;background:#161b22;border-bottom:1px solid #30363d;font-size:0.75rem;color:#8b949e;">
            💡 Lite Mode — Full editor on WiFi
          </div>
          <textarea id="lite-editor" style="flex:1;background:#0d1117;color:#e6edf3;border:none;padding:12px;font-family:monospace;font-size:14px;resize:none;outline:none;line-height:1.5;" spellcheck="false">// Athelgard Lite Editor\nfunction hello() {\n  console.log("Hello from mobile!");\n}\nhello();</textarea>
        </div>
      `;

      isLoading = false;
      return { 
        type: 'lite',
        getValue: () => document.getElementById('lite-editor')?.value || '',
        setValue: (v) => { const el = document.getElementById('lite-editor'); if (el) el.value = v; }
      };
    },

    loadScript(src) {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    },

    dispose() {
      if (editorInstance) {
        editorInstance.dispose();
        editorInstance = null;
      }
    }
  };

  document.addEventListener('pagehide', () => {
    if (window.MonacoLoader) window.MonacoLoader.dispose();
  });
})();
