// modules/brain.js — MELI's Brain: Ethical Hunt Loop + Builder Brain + Cost Router
import { MELI } from './config.js';

// ═══════════════════════════════════════════
// ETHICAL HUNT LOOP — Security gate
// ═══════════════════════════════════════════
export class EthicalHuntLoop {
  evaluate(attempt = {}) {
    const scope = attempt.scope || {};
    const evidence = attempt.evidence || {};
    const target = attempt.target || {};

    // Gate 1: Only simulated targets
    if (attempt.simulated !== true) {
      return this.#decision(MELI.HUNT_DECISIONS.BLOCKED, {
        reason: 'This loop only awards progress for sanctioned simulation targets.',
        mentorLine: 'Pause here. Training progress comes from the simulated range, not a live target.',
        nextAction: 'Return to an approved Bountywarz scenario.',
      });
    }

    // Gate 2: Scope authorization required
    if (!scope.program || !scope.authorized || !scope.inScope || !target.id) {
      return this.#decision(MELI.HUNT_DECISIONS.NEEDS_SCOPE, {
        reason: 'Program, authorization, target identity, and in-scope status are required.',
        mentorLine: 'Before the scan, establish the boundary: what is approved, and what is not?',
        nextAction: 'Review the scenario scope card and select an authorized target.',
      });
    }

    // Gate 3: Evidence completeness
    const missing = MELI.REPORT_EVIDENCE.filter(key => !this.#hasValue(evidence[key]));
    if (missing.length) {
      return this.#decision(MELI.HUNT_DECISIONS.INVESTIGATE, {
        reason: 'The observation is not yet a complete report.',
        mentorLine: 'You have a lead. Turn it into evidence before you call it a finding.',
        nextAction: `Collect: ${missing.join(', ')}.`,
        missingEvidence: missing,
      });
    }

    // Gate 4: Report ready
    return this.#decision(MELI.HUNT_DECISIONS.REPORT_READY, {
      reason: 'The simulated finding has scope, evidence, impact, and remediation context.',
      mentorLine: 'Now you can make the case clearly: boundary, evidence, impact, and a path to fix.',
      nextAction: 'Submit the simulated report for review.',
      rewards: ['scope-discipline', 'evidence-quality', 'responsible-reporting'],
      score: 100,
    });
  }

  #decision(status, detail) {
    return Object.freeze({ status, ...detail });
  }

  #hasValue(value) {
    return typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
  }
}

// ═══════════════════════════════════════════
// BUILDER BRAIN — AI Mentor
// ═══════════════════════════════════════════
export class BuilderBrain {
  reviewFinding(attempt) {
    const evidence = attempt.evidence || {};

    // Safety gate
    if (!attempt.simulated) {
      return {
        stage: MELI.BUILDER_STAGES.BOUNDARY,
        safeToReward: false,
        reason: 'Only simulated targets allowed.',
      };
    }
    if (!attempt.scope?.authorized) {
      return {
        stage: MELI.BUILDER_STAGES.BOUNDARY,
        safeToReward: false,
        reason: 'Scope authorization required.',
      };
    }

    // Score evidence
    const missing = MELI.EVIDENCE_FIELDS.filter(f => {
      const v = evidence[f];
      return !(typeof v === 'string' ? v.trim().length > 0 : Boolean(v));
    });

    if (missing.length > 0) {
      return {
        stage: MELI.BUILDER_STAGES.EVIDENCE,
        missingEvidence: missing,
        rubric: {
          score: Math.round((MELI.EVIDENCE_FIELDS.length - missing.length) / MELI.EVIDENCE_FIELDS.length * 100),
          maxScore: 100,
        },
        safeToReward: false,
        mentorLine: `You're missing: ${missing.join(', ')}. A strong finding needs all four evidence types.`,
      };
    }

    // Complete report
    return {
      stage: MELI.BUILDER_STAGES.READY,
      rubric: { score: 100, maxScore: 100 },
      safeToReward: true,
      reportOutline: {
        observation: evidence.observation,
        impact: evidence.impact,
        reproduction: evidence.reproduction,
        remediation: evidence.remediation,
      },
      mentorLine: 'Excellent work! This is a defensible responsible disclosure packet.',
    };
  }
}

// ═══════════════════════════════════════════
// COST ROUTER — Smart model selection
// ═══════════════════════════════════════════
export class CostRouter {
  selectModel(preferred, config) {
    const now = new Date();
    const pst = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
    const isPeak = pst.getHours() >= 9 && pst.getHours() < 21;

    if (preferred === 'deepseek' && isPeak && config.kimiKey) {
      console.log('[Athelgard] Peak hours — routing to Kimi fallback');
      return { model: 'kimi', reason: 'DeepSeek peak pricing (9AM-9PM PST)' };
    }
    if (preferred === 'kimi' && !isPeak && config.deepseekKey) {
      console.log('[Athelgard] Off-peak — using DeepSeek (cheaper)');
      return { model: 'deepseek', reason: 'DeepSeek off-peak (cheaper)' };
    }
    return { model: preferred, reason: 'User preference' };
  }
}

// ═══════════════════════════════════════════
// BOUNTY DETECTOR — Check if message is bounty-related
// ═══════════════════════════════════════════
export function isBountyQuery(text) {
  const lower = text.toLowerCase();
  const keywords = ['bounty', 'finding', 'vulnerability', 'security', 'hack', 
                    'pentest', 'scope', 'report', 'exploit', 'bug', 'ctf'];
  return keywords.some(k => lower.includes(k));
}

// ═══════════════════════════════════════════
// PARSER — Extract bounty attempt from chat message
// ═══════════════════════════════════════════
export function parseBountyAttempt(text) {
  return {
    simulated: /\b(simulated|practice|training|ctf|range)\b/i.test(text),
    target: {
      id: text.match(/target[:\s]+([^\n]+)/i)?.[1] || 
          text.match(/\b(target|app|site)[:\s]+([^\n]+)/i)?.[2] || null,
    },
    scope: {
      program: text.match(/program[:\s]+([^\n]+)/i)?.[1] || null,
      authorized: /\b(authorized|approved|sanctioned)\b/i.test(text),
      inScope: /\b(in.scope|inscope|scoped)\b/i.test(text) || true,
    },
    evidence: {
      observation: text.match(/observation[:\s]+([^\n]+(?:\n(?!(?:impact|reproduction|remediation)[:\s]).*)*)/i)?.[1]?.trim() || null,
      impact: text.match(/impact[:\s]+([^\n]+(?:\n(?!(?:reproduction|remediation)[:\s]).*)*)/i)?.[1]?.trim() || null,
      reproduction: text.match(/reproduction[:\s]+([^\n]+(?:\n(?!(?:remediation)[:\s]).*)*)/i)?.[1]?.trim() || null,
      remediation: text.match(/remediation[:\s]+([^\n]+)/i)?.[1]?.trim() || null,
    },
  };
}
