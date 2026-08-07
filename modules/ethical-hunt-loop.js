/**
 * Scope-first ethical bounty loop.
 * CommonJS version for Vercel Node.js runtime.
 */
const HUNT_DECISIONS = Object.freeze({
  BLOCKED: 'blocked',
  NEEDS_SCOPE: 'needs_scope',
  INVESTIGATE: 'investigate',
  REPORT_READY: 'report_ready',
});

const REPORT_EVIDENCE = ['observation', 'impact', 'reproduction', 'remediation'];

class EthicalHuntLoop {
  evaluate(attempt = {}) {
    const scope = attempt.scope || {};
    const evidence = attempt.evidence || {};
    const target = attempt.target || {};

    if (attempt.simulated !== true) {
      return this.decision(HUNT_DECISIONS.BLOCKED, {
        reason: 'This loop only awards progress for sanctioned simulation targets.',
        mentorLine: 'Pause here. Training progress comes from the simulated range, not a live target.',
        nextAction: 'Return to an approved Bountywarz scenario.',
      });
    }

    if (!scope.program || !scope.authorized || !scope.inScope || !target.id) {
      return this.decision(HUNT_DECISIONS.NEEDS_SCOPE, {
        reason: 'Program, authorization, target identity, and in-scope status are required.',
        mentorLine: 'Before the scan, establish the boundary: what is approved, and what is not?',
        nextAction: 'Review the scenario scope card and select an authorized target.',
      });
    }

    const missing = REPORT_EVIDENCE.filter(key => !this.hasValue(evidence[key]));
    if (missing.length) {
      return this.decision(HUNT_DECISIONS.INVESTIGATE, {
        reason: 'The observation is not yet a complete report.',
        mentorLine: 'You have a lead. Turn it into evidence before you call it a finding.',
        nextAction: `Collect: ${missing.join(', ')}.`,
        missingEvidence: missing,
      });
    }

    return this.decision(HUNT_DECISIONS.REPORT_READY, {
      reason: 'The simulated finding has scope, evidence, impact, and remediation context.',
      mentorLine: 'Now you can make the case clearly: boundary, evidence, impact, and a path to fix.',
      nextAction: 'Submit the simulated report for review.',
      rewards: ['scope-discipline', 'evidence-quality', 'responsible-reporting'],
    });
  }

  decision(status, detail) {
    return Object.freeze({ status, ...detail });
  }

  hasValue(value) {
    return typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
  }
}

module.exports = { EthicalHuntLoop, HUNT_DECISIONS };
