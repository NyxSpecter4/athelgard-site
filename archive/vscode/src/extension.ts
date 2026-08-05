import * as vscode from 'vscode';
import { AthelgardChatProvider } from './chatProvider';
import { DeepSeekClient } from './deepseek';
import { GitHubClient } from './github';
import { VercelClient } from './vercel';
import { SupabaseClient } from './supabase';
import { VoiceManager } from './voice';
import { PeakPricing } from './peakPricing';
import { BountyHunter } from './bountyHunter';

let chatProvider: AthelgardChatProvider;
let voiceManager: VoiceManager;
let peakPricing: PeakPricing;
let bountyHunter: BountyHunter;

export function activate(context: vscode.ExtensionContext) {
    console.log('🦉 Athelgard is activating...');

    const config = vscode.workspace.getConfiguration('athelgard');
    
    // Initialize clients
    const deepseek = new DeepSeekClient(config.get('apiKey') || '');
    const github = new GitHubClient(config.get('githubToken') || '');
    const vercel = new VercelClient(config.get('vercelToken') || '');
    const supabase = new SupabaseClient(
        config.get('supabaseUrl') || '',
        config.get('supabaseKey') || ''
    );

    // Initialize features
    peakPricing = new PeakPricing(deepseek);
    voiceManager = new VoiceManager(deepseek);
    bountyHunter = new BountyHunter(github, deepseek);
    chatProvider = new AthelgardChatProvider(
        context.extensionUri,
        deepseek,
        github,
        vercel,
        supabase,
        voiceManager,
        peakPricing
    );

    // Register chat panel
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('athelgard.chat', chatProvider)
    );

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('athelgard.openChat', () => {
            chatProvider.show();
        }),
        vscode.commands.registerCommand('athelgard.voiceMode', () => {
            voiceManager.toggle();
        }),
        vscode.commands.registerCommand('athelgard.explainCode', () => {
            explainSelectedCode(deepseek);
        }),
        vscode.commands.registerCommand('athelgard.fixCode', () => {
            fixSelectedCode(deepseek);
        }),
        vscode.commands.registerCommand('athelgard.generateTests', () => {
            generateTests(deepseek);
        }),
        vscode.commands.registerCommand('athelgard.bountyMode', () => {
            bountyHunter.toggle();
        }),
        vscode.commands.registerCommand('athelgard.peakStatus', () => {
            peakPricing.showStatus();
        }),
        vscode.commands.registerCommand('athelgard.pushToGitHub', () => {
            pushToGitHub(github);
        }),
        vscode.commands.registerCommand('athelgard.deployToVercel', () => {
            deployToVercel(vercel);
        })
    );

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

export function deactivate() {
    voiceManager?.dispose();
    peakPricing?.dispose();
}

// Command implementations
async function explainSelectedCode(deepseek: DeepSeekClient) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    
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
        
        const panel = vscode.window.createWebviewPanel(
            'explanation',
            'Code Explanation',
            vscode.ViewColumn.Beside,
            {}
        );
        panel.webview.html = `<pre>${explanation}</pre>`;
    });
}

async function fixSelectedCode(deepseek: DeepSeekClient) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    
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

async function generateTests(deepseek: DeepSeekClient) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    
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

async function pushToGitHub(github: GitHubClient) {
    // Implementation would use git commands or GitHub API
    vscode.window.showInformationMessage('Push to GitHub - implement with your repo');
}

async function deployToVercel(vercel: VercelClient) {
    vscode.window.showInformationMessage('Deploy to Vercel - implement with your project');
}
