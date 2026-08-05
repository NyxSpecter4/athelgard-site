import * as vscode from 'vscode';
import { GitHubClient } from './github';
import { DeepSeekClient } from './deepseek';

export class BountyHunter {
    private enabled = false;

    constructor(
        private github: GitHubClient,
        private deepseek: DeepSeekClient
    ) {}

    async toggle() {
        this.enabled = !this.enabled;
        const config = vscode.workspace.getConfiguration('athelgard');
        await config.update('bountyMode', this.enabled, true);

        if (this.enabled) {
            vscode.window.showInformationMessage('🐛 Bounty Hunt Mode activated!');
            this.startHunting();
        } else {
            vscode.window.showInformationMessage('Bounty Hunt Mode deactivated');
        }
    }

    private async startHunting() {
        // In bounty mode, Athelgard:
        // 1. Scans code for security vulnerabilities
        // 2. Checks for common bug patterns
        // 3. Suggests ethical bounty hunting targets
        // 4. Tracks findings in Supabase

        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const code = editor.document.getText();
        
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "🔍 Athelgard is hunting for bugs..."
        }, async () => {
            const findings = await this.deepseek.chat([
                { 
                    role: 'system', 
                    content: `You are a security researcher doing ethical bounty hunting. Analyze the code for:
1. Security vulnerabilities (OWASP Top 10)
2. Logic bugs that could be exploited
3. Input validation issues
4. Authentication/authorization flaws
5. Data exposure risks

Format as a bounty report with severity levels (Critical/High/Medium/Low).`
                },
                { role: 'user', content: code }
            ]);

            const panel = vscode.window.createWebviewPanel(
                'bountyReport',
                '🔍 Bounty Hunt Report',
                vscode.ViewColumn.Beside,
                {}
            );

            panel.webview.html = `
                <h1>🔍 Bounty Hunt Report</h1>
                <pre>${findings}</pre>
            `;
        });
    }
}
