import * as vscode from 'vscode';
import { DeepSeekClient } from './deepseek';

export class PeakPricing {
    private interval?: NodeJS.Timeout;
    private isPeak = false;

    constructor(private deepseek: DeepSeekClient) {}

    startMonitoring(statusBar: vscode.StatusBarItem) {
        this.checkPeak();
        this.interval = setInterval(() => {
            this.checkPeak(statusBar);
        }, 60000); // Check every minute
    }

    private checkPeak(statusBar?: vscode.StatusBarItem) {
        const now = new Date();
        const pst = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
        const hour = pst.getHours();
        const wasPeak = this.isPeak;
        this.isPeak = hour >= 9 && hour < 21;

        if (wasPeak !== this.isPeak && statusBar) {
            if (this.isPeak) {
                statusBar.text = "🦉 Athelgard ⚠";
                statusBar.tooltip = "Peak pricing active (2x cost)";
                vscode.window.showWarningMessage('⚠ DeepSeek peak pricing started (2x cost). Consider switching to off-peak model.');
            } else {
                statusBar.text = "🦉 Athelgard ✓";
                statusBar.tooltip = "Off-peak pricing (50% off)";
                vscode.window.showInformationMessage('✓ DeepSeek off-peak pricing started (50% off)!');
            }
        }
    }

    showStatus() {
        const now = new Date();
        const pst = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
        const hour = pst.getHours();
        const isPeak = hour >= 9 && hour < 21;

        const message = isPeak
            ? `⚠ Peak Hours (9AM-9PM PST)\nDeepSeek V3: $2.00/M tokens\nConsider using Coder model for cheaper rates`
            : `✓ Off-Peak Hours (9PM-9AM PST)\nDeepSeek V3: $1.00/M tokens\nBest time to code!`;

        vscode.window.showInformationMessage(message, { modal: true });
    }

    isCurrentlyPeak(): boolean {
        return this.isPeak;
    }

    dispose() {
        if (this.interval) clearInterval(this.interval);
    }
}
