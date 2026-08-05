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
exports.BountyHunter = void 0;
const vscode = __importStar(require("vscode"));
class BountyHunter {
    github;
    deepseek;
    enabled = false;
    constructor(github, deepseek) {
        this.github = github;
        this.deepseek = deepseek;
    }
    async toggle() {
        this.enabled = !this.enabled;
        const config = vscode.workspace.getConfiguration('athelgard');
        await config.update('bountyMode', this.enabled, true);
        if (this.enabled) {
            vscode.window.showInformationMessage('🐛 Bounty Hunt Mode activated!');
            this.startHunting();
        }
        else {
            vscode.window.showInformationMessage('Bounty Hunt Mode deactivated');
        }
    }
    async startHunting() {
        // In bounty mode, Athelgard:
        // 1. Scans code for security vulnerabilities
        // 2. Checks for common bug patterns
        // 3. Suggests ethical bounty hunting targets
        // 4. Tracks findings in Supabase
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
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
            const panel = vscode.window.createWebviewPanel('bountyReport', '🔍 Bounty Hunt Report', vscode.ViewColumn.Beside, {});
            panel.webview.html = `
                <h1>🔍 Bounty Hunt Report</h1>
                <pre>${findings}</pre>
            `;
        });
    }
}
exports.BountyHunter = BountyHunter;
//# sourceMappingURL=bountyHunter.js.map