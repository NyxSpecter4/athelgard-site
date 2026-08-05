// modules/game-connector.js — Bridges Athelgard with bountywarz engine
/**
 * Usage in bountywarz:
 * 
 * import { AthelgardGameConnector } from './athelgard/game-connector.js';
 * 
 * const athelgard = new AthelgardGameConnector({
 *   gameEngine: window.game,
 *   player: window.player,
 *   map: window.sfMap,
 * });
 * 
 * // Athelgard now knows about the game world
 * athelgard.enable();
 */

import { AthelgardCompanion } from './companion.js';
import { AthelgardHUD } from './hud.js';

export class AthelgardGameConnector {
  constructor(options = {}) {
    this.game = options.gameEngine;
    this.player = options.player;
    this.map = options.map;
    
    this.companion = new AthelgardCompanion({
      onSpeak: (text) => this.onAthelgardSpeak(text),
      onUpdateHUD: (data) => this.onHUDUpdate(data),
    });
    
    this.hud = new AthelgardHUD();
    this.hud.onMessage = (text) => this.onPlayerMessage(text);
    this.hud.bindKey('KeyT'); // Press 'T' to talk to Athelgard
    
    this.enabled = false;
    this.updateInterval = null;
  }

  enable() {
    this.enabled = true;
    this.startMonitoring();
    this.hud.showBubble("Athelgard online, Captain. Press 'T' to chat.");
    console.log('[Athelgard] Connected to bountywarz engine');
  }

  disable() {
    this.enabled = false;
    this.stopMonitoring();
    this.hud.hide();
  }

  // Called when game engine updates (every frame or tick)
  startMonitoring() {
    this.updateInterval = setInterval(() => {
      if (!this.enabled) return;
      
      const context = this.gatherContext();
      this.companion.updateContext(context);
      
      // Check for contextual triggers
      this.checkTriggers(context);
    }, 1000); // Check every second
  }

  stopMonitoring() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Gather game state for Athelgard
  gatherContext() {
    return {
      playerLocation: this.getPlayerLocation(),
      droneStatus: this.getDroneStatus(),
      activeMission: this.getActiveMission(),
      nearbyTargets: this.getNearbyTargets(),
      health: this.player?.health,
      score: this.player?.score,
      time: Date.now(),
    };
  }

  // Player sends message to Athelgard
  async onPlayerMessage(text) {
    const context = this.gatherContext();
    const response = await this.companion.receiveCommand(text, context);
    
    // Handle response
    if (response.type === 'bounty_complete') {
      this.hud.addMessage('assistant', `✅ Bounty Complete! Score: ${response.score}/100`);
      this.triggerReward(response.rewards);
    } else if (response.type === 'bounty_incomplete') {
      this.hud.addMessage('assistant', `🔍 Missing: ${response.missingEvidence?.join(', ')}`);
    } else if (response.type === 'location_report') {
      this.hud.addMessage('assistant', `📍 ${response.nearby.name}: ${response.nearby.bounties} bounties, ${response.nearby.ctf} CTF zones`);
    } else {
      this.hud.addMessage('assistant', "I'm on it, Captain...");
      // Route to AI
      const aiResponse = await this.callAI(text);
      this.hud.addMessage('assistant', aiResponse);
    }
  }

  // Athelgard speaks (voice or text)
  onAthelgardSpeak(text) {
    // Show in HUD
    this.hud.addMessage('assistant', text);
    
    // Voice synthesis (if enabled)
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.1;
      u.pitch = 1.0;
      window.speechSynthesis.speak(u);
    }
  }

  // HUD update (scores, alerts)
  onHUDUpdate(data) {
    if (data.bountyScore) {
      this.game?.ui?.showScore(data.bountyScore);
    }
  }

  // Contextual triggers
  checkTriggers(context) {
    // Entering new sector
    if (context.playerLocation?.sector !== this.lastSector) {
      this.lastSector = context.playerLocation?.sector;
      this.companion.onEnterSector(context.playerLocation);
    }

    // Low health
    if (context.health < 30 && context.health > 0) {
      if (!this.warnedLowHealth) {
        this.companion.speak("Warning: Hull integrity critical. Recommend immediate landing.");
        this.warnedLowHealth = true;
      }
    } else if (context.health >= 30) {
      this.warnedLowHealth = false;
    }

    // Bounty target nearby
    const nearbyBounties = context.nearbyTargets?.filter(t => t.type === 'bounty');
    if (nearbyBounties?.length > 0 && !this.warnedBounty) {
      this.companion.speak(`Bounty target detected ${nearbyBounties[0].distance}m ahead. Scope before engaging.`);
      this.warnedBounty = true;
    }
  }

  // Game engine integrations (stubs — implement based on bountywarz API)
  getPlayerLocation() {
    return this.player?.position ? {
      x: this.player.position.x,
      y: this.player.position.y,
      z: this.player.position.z,
      sector: this.map?.getSector(this.player.position),
    } : null;
  }

  getDroneStatus() {
    return this.player?.drone ? {
      battery: this.player.drone.battery,
      altitude: this.player.drone.altitude,
      speed: this.player.drone.speed,
    } : null;
  }

  getActiveMission() {
    return this.game?.missions?.find(m => m.active);
  }

  getNearbyTargets() {
    return this.game?.entities?.filter(e => 
      e.type === 'bounty' || e.type === 'ctf'
    ).map(e => ({
      type: e.type,
      distance: this.distanceTo(e.position),
      position: e.position,
    })) || [];
  }

  distanceTo(pos) {
    if (!this.player?.position || !pos) return Infinity;
    const dx = this.player.position.x - pos.x;
    const dy = this.player.position.y - pos.y;
    const dz = this.player.position.z - pos.z;
    return Math.sqrt(dx*dx + dy*dy + dz*dz);
  }

  triggerReward(rewards) {
    rewards?.forEach(reward => {
      this.game?.addReward?.(reward);
    });
  }

  async callAI(text) {
    // This would call DeepSeek/Kimi through the game server
    // or use the chat.js module
    return "I'm analyzing that for you, Captain...";
  }
}
