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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const chatProvider_1 = require("./chatProvider");
const deepseek_1 = require("./deepseek");
const github_1 = require("./github");
const vercel_1 = require("./vercel");
const supabase_1 = require("./supabase");
const voice_1 = require("./voice");
const peakPricing_1 = require("./peakPricing");
const bountyHunter_1 = require("./bountyHunter");
let chatProvider;
let voiceManager;
let peakPricing;
let bountyHunter;
function activate(context) {
    console.log('🦉 Athelgard is activating...');
    const config = vscode.workspace.getConfiguration('athelgard');
    // Initialize clients
    const deepseek = new deepseek_1.DeepSeekClient(config.get('apiKey') || '');
    const github = new github_1.GitHubClient(config.get('githubToken') || '');
    const vercel = new vercel_1.VercelClient(config.get('vercelToken') || '');
    const supabase = new supabase_1.SupabaseClient(config.get('supabaseUrl') || '', config.get('supabaseKey') || '');
    // Initialize features
    peakPricing = new peakPricing_1.PeakPricing(deepseek);
    voiceManager = new voice_1.VoiceManager(deepseek);
    bountyHunter = new bountyHunter_1.BountyHunter(github, deepseek);
    chatProvider = new chatProvider_1.AthelgardChatProvider(context.extensionUri, deepseek, github, vercel, supabase, voiceManager, peakPricing);
    // Register chat panel
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('athelgard.chat', chatProvider));
    // Register commands
    context.subscriptions.push(vscode.commands.registerCommand('athelgard.openChat', () => {
        chatProvider.show();
    }), vscode.commands.registerCommand('athelgard.voiceMode', () => {
        voiceManager.toggle();
    }), vscode.commands.registerCommand('athelgard.explainCode', () => {
        explainSelectedCode(deepseek);
    }), vscode.commands.registerCommand('athelgard.fixCode', () => {
        fixSelectedCode(deepseek);
    }), vscode.commands.registerCommand('athelgard.generateTests', () => {
        generateTests(deepseek);
    }), vscode.commands.registerCommand('athelgard.bountyMode', () => {
        bountyHunter.toggle();
    }), vscode.commands.registerCommand('athelgard.peakStatus', () => {
        peakPricing.showStatus();
    }), vscode.commands.registerCommand('athelgard.pushToGitHub', () => {
        pushToGitHub(github);
    }), vscode.commands.registerCommand('athelgard.deployToVercel', () => {
        deployToVercel(vercel);
    }));
    // Status bar item
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBar.text = "🦉 Athelgard";
    statusBar.tooltip = "Click to open Athelgard";
    statusBar.command = 'athelgard.openChat';
    statusBar.show();
    context.subscriptions.push(statusBar);
    // Peak pricing monitor
    peakPricing.startMonitoring(statusBar);
    console.log('🦉 Athelgard is ACTIVE');
}
function deactivate() {
    voiceManager?.dispose();
    peakPricing?.dispose();
}
// Command implementations
async function explainSelectedCode(deepseek) {
    const editor = vscode.window.activeTextEditor;
    if (!editor)
        return;
    const selection = editor.selection;
    const code = editor.document.getText(selection);
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Athelgard is analyzing..."
    }, async () => {
        const explanation = await deepseek.chat([
            { role: 'system', content: 'Explain this code concisely.' },
            { role: 'user', content: code }
        ]);
        const panel = vscode.window.createWebviewPanel('explanation', 'Code Explanation', vscode.ViewColumn.Beside, {});
        panel.webview.html = `<pre>${explanation}</pre>`;
    });
}
async function fixSelectedCode(deepseek) {
    const editor = vscode.window.activeTextEditor;
    if (!editor)
        return;
    const selection = editor.selection;
    const code = editor.document.getText(selection);
    const fixed = await deepseek.chat([
        { role: 'system', content: 'Fix any bugs in this code. Return only the fixed code.' },
        { role: 'user', content: code }
    ]);
    editor.edit(editBuilder => {
        editBuilder.replace(selection, fixed);
    });
}
async function generateTests(deepseek) {
    const editor = vscode.window.activeTextEditor;
    if (!editor)
        return;
    const code = editor.document.getText();
    const tests = await deepseek.chat([
        { role: 'system', content: 'Generate unit tests for this code.' },
        { role: 'user', content: code }
    ]);
    const doc = await vscode.workspace.openTextDocument({
        content: tests,
        language: editor.document.languageId
    });
    await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
}
async function pushToGitHub(github) {
    // Implementation would use git commands or GitHub API
    vscode.window.showInformationMessage('Push to GitHub - implement with your repo');
}
async function deployToVercel(vercel) {
    vscode.window.showInformationMessage('Deploy to Vercel - implement with your project');
}
//# sourceMappingURL=extension.js.map