import * as vscode from 'vscode';
import { DeepSeekClient } from './deepseek';
import { GitHubClient } from './github';
import { VercelClient } from './vercel';
import { SupabaseClient } from './supabase';
import { VoiceManager } from './voice';
import { PeakPricing } from './peakPricing';

export class AthelgardChatProvider implements vscode.WebviewViewProvider {
    private view?: vscode.WebviewView;
    private messageHistory: Array<{role: string, content: string}> = [];

    constructor(
        private extensionUri: vscode.Uri,
        private deepseek: DeepSeekClient,
        private github: GitHubClient,
        private vercel: VercelClient,
        private supabase: SupabaseClient,
        private voice: VoiceManager,
        private peakPricing: PeakPricing
    ) {}

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        token: vscode.CancellationToken
    ) {
        this.view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.extensionUri]
        };

        webviewView.webview.html = this.getHtml();

        webviewView.webview.onDidReceiveMessage(async message => {
            switch (message.type) {
                case 'chat':
                    await this.handleChat(message.text);
                    break;
                case 'voice':
                    await this.voice.toggle();
                    break;
                case 'github':
                    await this.handleGitHub(message.repo);
                    break;
                case 'vercel':
                    await this.handleVercel();
                    break;
                case 'supabase':
                    await this.handleSupabase(message.table);
                    break;
                case 'peak':
                    this.peakPricing.showStatus();
                    break;
            }
        });
    }

    show() {
        this.view?.show(true);
    }

    private async handleChat(text: string) {
        if (!this.view) return;

        // Get current file context
        const editor = vscode.window.activeTextEditor;
        const fileContext = editor ? {
            fileName: editor.document.fileName,
            language: editor.document.languageId,
            content: editor.document.getText()
        } : null;

        // Add user message
        this.postMessage({ type: 'user', text });
        this.messageHistory.push({ role: 'user', content: text });

        // Build system prompt with context
        let systemPrompt = `You are Athelgard, a skilled coding assistant. Help the user write, debug, and understand code.`;
        if (fileContext) {
            systemPrompt += `\n\nCurrent file: ${fileContext.fileName}\nLanguage: ${fileContext.language}\n\nFile content:\n${fileContext.content.substring(0, 4000)}`;
        }

        // Stream response
        this.postMessage({ type: 'start-stream' });
        let fullResponse = '';

        try {
            await this.deepseek.streamChat([
                { role: 'system', content: systemPrompt },
                ...this.messageHistory.slice(-6),
                { role: 'user', content: text }
            ], (chunk) => {
                fullResponse += chunk;
                this.postMessage({ type: 'stream', chunk });
            });

            this.postMessage({ type: 'end-stream' });
            this.messageHistory.push({ role: 'assistant', content: fullResponse });

            // Keep history manageable
            if (this.messageHistory.length > 20) {
                this.messageHistory = this.messageHistory.slice(-20);
            }

        } catch (err) {
            this.postMessage({ 
                type: 'error', 
                text: err instanceof Error ? err.message : 'Unknown error'
            });
        }
    }

    private async handleGitHub(repo: string) {
        try {
            const files = await this.github.listDirectory(repo, '');
            this.postMessage({ type: 'github-files', files });
        } catch (err) {
            this.postMessage({ type: 'error', text: 'Failed to load GitHub repo' });
        }
    }

    private async handleVercel() {
        try {
            const projects = await this.vercel.listProjects();
            this.postMessage({ type: 'vercel-projects', projects });
        } catch (err) {
            this.postMessage({ type: 'error', text: 'Failed to load Vercel projects' });
        }
    }

    private async handleSupabase(table: string) {
        try {
            const data = await this.supabase.select(table, { limit: 20 });
            this.postMessage({ type: 'supabase-data', data });
        } catch (err) {
            this.postMessage({ type: 'error', text: 'Failed to query Supabase' });
        }
    }

    private postMessage(message: any) {
        this.view?.webview.postMessage(message);
    }

    private getHtml(): string {
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: var(--vscode-font-family);
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            margin: 0;
            padding: 12px;
            display: flex;
            flex-direction: column;
            height: 100vh;
        }
        .header {
            display: flex;
            align-items: center;
            gap: 8px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }
        .logo { font-size: 20px; }
        .title { font-weight: 600; font-size: 14px; }
        .peak-badge {
            margin-left: auto;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 10px;
            background: var(--vscode-badge-background);
        }
        .messages {
            flex: 1;
            overflow-y: auto;
            padding: 8px 0;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .msg {
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 13px;
            line-height: 1.5;
        }
        .msg-user {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            align-self: flex-end;
        }
        .msg-assistant {
            background: var(--vscode-editor-inactiveSelectionBackground);
            align-self: flex-start;
        }
        .input-area {
            display: flex;
            gap: 8px;
            padding-top: 8px;
        }
        .chat-input {
            flex: 1;
            background: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            border-radius: 6px;
            padding: 8px;
            color: var(--vscode-input-foreground);
            font-family: var(--vscode-font-family);
            font-size: 13px;
            outline: none;
        }
        .btn {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 6px;
            padding: 8px 12px;
            cursor: pointer;
            font-size: 13px;
        }
        .btn:hover { opacity: 0.9; }
        .toolbar {
            display: flex;
            gap: 6px;
            padding: 8px 0;
        }
        .tool-btn {
            background: var(--vscode-badge-background);
            border: none;
            border-radius: 4px;
            padding: 4px 10px;
            font-size: 11px;
            cursor: pointer;
            color: var(--vscode-badge-foreground);
        }
        pre {
            background: rgba(0,0,0,0.2);
            padding: 8px;
            border-radius: 4px;
            overflow-x: auto;
        }
        code {
            font-family: var(--vscode-editor-font-family);
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <span class="logo">🦉</span>
        <span class="title">Athelgard</span>
        <span class="peak-badge" id="peak-badge">Checking...</span>
    </div>
    
    <div class="toolbar">
        <button class="tool-btn" onclick="sendTool('github')">🐙 GitHub</button>
        <button class="tool-btn" onclick="sendTool('vercel')">▲ Vercel</button>
        <button class="tool-btn" onclick="sendTool('supabase')">🟢 Supabase</button>
        <button class="tool-btn" onclick="sendTool('peak')">💰 Pricing</button>
    </div>
    
    <div class="messages" id="messages"></div>
    
    <div class="input-area">
        <input class="chat-input" id="input" placeholder="Ask Athelgard..." 
               onkeydown="if(event.key==='Enter')send()">
        <button class="btn" onclick="send()">➤</button>
        <button class="btn" onclick="voice()">🎤</button>
    </div>

    <script>
        const messages = document.getElementById('messages');
        const input = document.getElementById('input');
        let streaming = false;
        let streamContent = '';
        let streamDiv = null;

        // Peak status
        function updatePeakStatus(isPeak) {
            const badge = document.getElementById('peak-badge');
            if (isPeak) {
                badge.textContent = '⚠ Peak (2x cost)';
                badge.style.color = 'var(--vscode-errorForeground)';
            } else {
                badge.textContent = '✓ Off-Peak (50% off)';
                badge.style.color = 'var(--vscode-terminal-ansiGreen)';
            }
        }

        // Check peak on load
        const now = new Date();
        const pst = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
        updatePeakStatus(pst.getHours() >= 9 && pst.getHours() < 21);

        function send() {
            const text = input.value.trim();
            if (!text) return;
            vscode.postMessage({ type: 'chat', text });
            input.value = '';
        }

        function voice() {
            vscode.postMessage({ type: 'voice' });
        }

        function sendTool(tool) {
            vscode.postMessage({ type: tool });
        }

        function addMessage(role, text) {
            const div = document.createElement('div');
            div.className = 'msg msg-' + role;
            div.innerHTML = text;
            messages.appendChild(div);
            messages.scrollTop = messages.scrollHeight;
        }

        window.addEventListener('message', event => {
            const msg = event.data;
            switch (msg.type) {
                case 'user':
                    addMessage('user', msg.text);
                    break;
                case 'start-stream':
                    streaming = true;
                    streamContent = '';
                    streamDiv = document.createElement('div');
                    streamDiv.className = 'msg msg-assistant';
                    messages.appendChild(streamDiv);
                    break;
                case 'stream':
                    if (streamDiv) {
                        streamContent += msg.chunk;
                        streamDiv.innerHTML = streamContent;
                        messages.scrollTop = messages.scrollHeight;
                    }
                    break;
                case 'end-stream':
                    streaming = false;
                    break;
                case 'error':
                    addMessage('assistant', '❌ ' + msg.text);
                    break;
            }
        });
    </script>
</body>
</html>`;
    }
}
