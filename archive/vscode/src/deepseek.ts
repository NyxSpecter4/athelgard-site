import * as vscode from 'vscode';

export class DeepSeekClient {
    private apiKey: string;
    private baseUrl = 'https://api.deepseek.com';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async chat(messages: Array<{role: string, content: string}>, options?: {
        model?: string;
        temperature?: number;
        maxTokens?: number;
    }): Promise<string> {
        const config = vscode.workspace.getConfiguration('athelgard');
        
        // Check peak pricing and switch model if needed
        const now = new Date();
        const pst = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
        const hour = pst.getHours();
        const isPeak = hour >= 9 && hour < 21;
        
        let model = options?.model || config.get('model') as string;
        if (isPeak && config.get('peakModel')) {
            model = config.get('peakModel') as string;
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

        const data = await response.json() as any;
        return data.choices[0]?.message?.content || '';
    }

    async streamChat(
        messages: Array<{role: string, content: string}>,
        onChunk: (chunk: string) => void,
        options?: { model?: string; temperature?: number }
    ): Promise<void> {
        const config = vscode.workspace.getConfiguration('athelgard');
        let model = options?.model || config.get('model') as string;
        
        // Peak pricing check
        const now = new Date();
        const pst = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
        const hour = pst.getHours();
        if (hour >= 9 && hour < 21 && config.get('peakModel')) {
            model = config.get('peakModel') as string;
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
        if (!reader) return;

        const decoder = new TextDecoder();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '));
            
            for (const line of lines) {
                const json = line.replace('data: ', '');
                if (json === '[DONE]') continue;
                try {
                    const parsed = JSON.parse(json);
                    const content = parsed.choices[0]?.delta?.content;
                    if (content) onChunk(content);
                } catch (e) {
                    // Ignore parse errors for [DONE] or empty lines
                }
            }
        }
    }
}
