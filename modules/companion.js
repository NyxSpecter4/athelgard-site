/**
 * ATHELGARD GAME MODULE
 * Drop-in AI mentor for bountywarz
 * 
 * Usage:
 *   import { AthelgardCompanion } from './athelgard/companion.js';
 *   const athelgard = new AthelgardCompanion();
 *   athelgard.speak("Captain, anomaly detected at sector 7.");
 */

import { EthicalHuntLoop, BuilderBrain, isBountyQuery, parseBountyAttempt } from './brain.js';
import { CostRouter } from './brain.js';

export class AthelgardCompanion {
  constructor(options = {}) {
    this.huntLoop = new EthicalHuntLoop();
    this.builderBrain = new BuilderBrain();
    this.costRouter = new CostRouter();
    this.context = {
      playerLocation: null,
      activeMission: null,
      droneStatus: null,
      lastBounty: null,
    };
    this.voiceEnabled = options.voice !== false;
    this.onSpeak = options.onSpeak || (() => {});
    this.onUpdateHUD = options.onUpdateHUD || (() => {});
  }

  // Player asks Athelgard something
  async receiveCommand(text, playerContext = {}) {
    this.updateContext(playerContext);

    // Check if bounty-related
    if (isBountyQuery(text)) {
      return this.handleBountyQuery(text);
    }

    // Check if asking about surroundings
    if (this.isLocationQuery(text)) {
      return this.handleLocationQuery();
    }

    // Check if asking for help
    if (this.isHelpQuery(text)) {
      return this.handleHelpQuery(text);
    }

    // Default: AI chat
    return this.handleGeneralChat(text);
  }

  // Bounty submission during gameplay
  handleBountyQuery(text) {
    const attempt = parseBountyAttempt(text);
    const gate = this.huntLoop.evaluate(attempt);

    switch (gate.status) {
      case 'blocked':
        this.speak(gate.mentorLine);
        return { type: 'bounty_blocked', ...gate };

      case 'needs_scope':
        this.speak(gate.mentorLine);
        return { type: 'bounty_needs_scope', ...gate };

      case 'investigate':
        this.speak(`You're missing: ${gate.missingEvidence.join(', ')}. ${gate.mentorLine}`);
        return { type: 'bounty_incomplete', ...gate };

      case 'report_ready':
        this.speak(`Excellent work, Captain! ${gate.mentorLine}`);
        this.onUpdateHUD({ bountyScore: gate.score, rewards: gate.rewards });
        return { type: 'bounty_complete', ...gate };
    }
  }

  // Player asks "what's around me?"
  handleLocationQuery() {
    const loc = this.context.playerLocation;
    if (!loc) {
      this.speak("I'm not picking up your location, Captain. GPS offline?");
      return { type: 'location_unknown' };
    }

    // This would connect to bountywarz's world data
    const nearby = this.getNearbyPOIs(loc);
    this.speak(`You're near ${nearby.name}. I see ${nearby.bounties} active bounty targets and ${nearby.ctf} CTF zones within range.`);
    return { type: 'location_report', nearby };
  }

  // Player asks for coding help
  async handleHelpQuery(text) {
    // Route to AI
    this.speak("Let me check the docs for you, Captain...");
    return { type: 'help_request', query: text };
  }

  // General chat
  async handleGeneralChat(text) {
    // This would call DeepSeek/Kimi
    return { type: 'chat', message: text };
  }

  // Contextual triggers (called by game engine)
  onEnterSector(sector) {
    this.context.playerLocation = sector;
    const bounties = this.getBountiesInSector(sector);
    if (bounties.length > 0) {
      this.speak(`Entering ${sector.name}. ${bounties.length} bounty targets detected. Want me to scan?`);
    }
  }

  onDroneDamaged() {
    this.speak("Taking fire! Recommend evasive maneuvers, Captain.");
  }

  onBountyDiscovered(bounty) {
    this.context.lastBounty = bounty;
    this.speak(`Bounty target acquired: ${bounty.target}. Remember — document before you engage. Scope first.`);
  }

  onCTFCaptured(team) {
    this.speak(`${team} captured the flag! Good tactical awareness, Captain.`);
  }

  // Voice output
  speak(text) {
    if (this.voiceEnabled) {
      // Use Web Speech API or ElevenLabs
      this.onSpeak(text);
    }
  }

  // Update internal context
  updateContext(ctx) {
    Object.assign(this.context, ctx);
  }

  // Helper: check query types
  isLocationQuery(text) {
    const t = text.toLowerCase();
    return t.includes('where') || t.includes('around') || t.includes('nearby') || t.includes('sector');
  }

  isHelpQuery(text) {
    const t = text.toLowerCase();
    return t.includes('help') || t.includes('how') || t.includes('teach') || t.includes('explain');
  }

  // Stub: would connect to game world API
  getNearbyPOIs(location) {
    // This connects to bountywarz world data
    return { name: 'Downtown SF', bounties: 3, ctf: 1 };
  }

  getBountiesInSector(sector) {
    // This connects to bountywarz mission system
    return [];
  }
}
