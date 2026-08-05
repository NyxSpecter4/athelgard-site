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
exports.VoiceManager = void 0;
const vscode = __importStar(require("vscode"));
class VoiceManager {
    deepseek;
    recognition;
    isListening = false;
    constructor(deepseek) {
        this.deepseek = deepseek;
    }
    async toggle() {
        if (this.isListening) {
            this.stop();
        }
        else {
            this.start();
        }
    }
    start() {
        // Use Web Speech API in webview, or VS Code speech API if available
        const config = vscode.workspace.getConfiguration('athelgard');
        if (!config.get('voiceEnabled')) {
            vscode.window.showInformationMessage('Voice mode is disabled in settings');
            return;
        }
        vscode.window.showInformationMessage('🎤 Voice mode activated - speak now');
        this.isListening = true;
        // In a real implementation, this would:
        // 1. Use Web Speech API in the webview
        // 2. Or use a native speech recognition library
        // 3. Stream audio to a speech-to-text service (AssemblyAI, Whisper, etc.)
        // 4. Send transcribed text to DeepSeek
        // 5. Use text-to-speech for responses (ElevenLabs, etc.)
    }
    stop() {
        this.isListening = false;
        vscode.window.showInformationMessage('🎤 Voice mode stopped');
    }
    dispose() {
        this.stop();
    }
}
exports.VoiceManager = VoiceManager;
//# sourceMappingURL=voice.js.map