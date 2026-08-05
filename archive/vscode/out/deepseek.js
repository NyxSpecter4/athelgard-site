"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeepSeekClient = void 0;
const vscode = __importStar(require("vscode"));
class DeepSeekClient {
    apiKey;
    baseUrl = 'https://api.deepseek.com';
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    async chat(messages, options) {
        const config = vscode.workspace.getConfiguration('athelgard');
        // Check peak pricing and switch model if needed
        const now = new Date();
        const pst = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
        const hour = pst.getHours();
        const isPeak = hour >= 9 && hour < 21;
        let model = options?.model || config.get('model');
        if (isPeak && config.get('peakModel')) {
            model = config.get('peakModel');
        }
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: options?.temperature || config.get('temperature') || 0.7,
                max_tokens: options?.maxTokens || 4000
            })
        });
        if (!response.ok) {
            throw new Error(`DeepSeek API error: ${response.status}`);
        }
        const data = await response.json();
        return data.choices[0]?.message?.content || '';
    }
    async streamChat(messages, onChunk, options) {
        const config = vscode.workspace.getConfiguration('athelgard');
        let model = options?.model || config.get('model');
        // Peak pricing check
        const now = new Date();
        const pst = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
        const hour = pst.getHours();
        if (hour >= 9 && hour < 21 && config.get('peakModel')) {
            model = config.get('peakModel');
        }
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: options?.temperature || config.get('temperature') || 0.7,
                stream: true
            })
        });
        const reader = response.body?.getReader();
        if (!reader)
            return;
        const decoder = new TextDecoder();
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '));
            for (const line of lines) {
                const json = line.replace('data: ', '');
                if (json === '[DONE]')
                    continue;
                try {
                    const parsed = JSON.parse(json);
                    const content = parsed.choices[0]?.delta?.content;
                    if (content)
                        onChunk(content);
                }
                catch (e) {
                    // Ignore parse errors for [DONE] or empty lines
                }
            }
        }
    }
}
exports.DeepSeekClient = DeepSeekClient;
//# sourceMappingURL=deepseek.js.map