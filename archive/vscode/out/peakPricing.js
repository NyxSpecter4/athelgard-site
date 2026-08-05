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
exports.PeakPricing = void 0;
const vscode = __importStar(require("vscode"));
class PeakPricing {
    deepseek;
    interval;
    isPeak = false;
    constructor(deepseek) {
        this.deepseek = deepseek;
    }
    startMonitoring(statusBar) {
        this.checkPeak();
        this.interval = setInterval(() => {
            this.checkPeak(statusBar);
        }, 60000); // Check every minute
    }
    checkPeak(statusBar) {
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
            }
            else {
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
    isCurrentlyPeak() {
        return this.isPeak;
    }
    dispose() {
        if (this.interval)
            clearInterval(this.interval);
    }
}
exports.PeakPricing = PeakPricing;
//# sourceMappingURL=peakPricing.js.map