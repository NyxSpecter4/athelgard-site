/**
 * Athelgard Builder Brain
 * CommonJS version for Vercel Node.js runtime.
 */
const { EthicalHuntLoop, HUNT_DECISIONS } = require('./ethical-hunt-loop.js');

const EVIDENCE_FIELDS = Object.freeze(['observation', 'impact', 'reproduction', 'remediation']);

const BUILDER_STAGES = Object.freeze({
  BOUNDARY: 'boundary',
  EVIDENCE: 'evidence',
  REVIEW: 'review',
  READY: 'ready',
});

class AthelgardBuilderBrain {
  constructor({ huntLoop = new EthicalHuntLoop() } = {}) {
    this.huntLoop = huntLoop;
  }

  reviewFinding({ attempt = {}, playerLevel = 1 } = {}) {
    const gate = this.huntLoop.evaluate(attempt);
    const base = {
      decision: gate.status,
      playerLevel,
      mentorLine: gate.mentorLine,
      nextAction: gate.nextAction,
      safeToReward: gate.status === HUNT_DECISIONS.REPORT_READY,
    };

    if (gate.status === HUNT_DECISIONS.BLOCKED || gate.status === HUNT_DECISIONS.NEEDS_SCOPE) {
      return Object.freeze({
        ...base,
        stage: BUILDER_STAGES.BOUNDARY,
        rubric: this.emptyRubric(),
        lesson: 'Scope is a skill. Establish the approved boundary before investigating.',
      });
    }

    const rubric = this.scoreEvidence(attempt.evidence || {});
    if (gate.status === HUNT_DECISIONS.INVESTIGATE) {
      return Object.freeze({
        ...base,
        stage: BUILDER_STAGES.EVIDENCE,
        rubric,
        missingEvidence: gate.missingEvidence,
        lesson: this.lessonFor(gate.missingEvidence[0]),
      });
    }

    return Object.freeze({
      ...base,
      stage: BUILDER_STAGES.READY,
      rubric,
      reportOutline: this.reportOutline(attempt),
      rewards: [...(gate.rewards || []), 'builder-brain-review'],
      lesson: 'A strong finding explains the boundary, supports the claim, names the impact, and helps the owner fix it.',
    });
  }

  scoreEvidence(evidence) {
    const fields = EVIDENCE_FIELDS.map(field => {
      const text = typeof evidence[field] === 'string' ? evidence[field].trim() : '';
      const present = text.length > 0;
      return Object.freeze({ field, present, quality: present ? this.quality(text) : 'missing' });
    });
    const completed = fields.filter(item => item.present).length;
    return Object.freeze({ fields, completed, total: EVIDENCE_FIELDS.length, score: completed * 25 });
  }

  quality(text) {
    if (text.length < 24) return 'thin';
    if (/\b(maybe|perhaps|guess|seems)\b/i.test(text)) return 'tentative';
    return 'supported';
  }

  reportOutline(attempt) {
    const evidence = attempt.evidence || {};
    return Object.freeze({
      title: `Simulated finding: ${attempt.target?.id || 'authorized target'}`,
      scope: attempt.scope?.program || 'authorized simulation',
      observation: evidence.observation,
      impact: evidence.impact,
      reproduction: evidence.reproduction,
      remediation: evidence.remediation,
    });
  }

  emptyRubric() {
    return Object.freeze({ fields: [], completed: 0, total: EVIDENCE_FIELDS.length, score: 0 });
  }

  lessonFor(field) {
    const lessons = {
      observation: 'State what the simulation showed, without jumping from a signal to a conclusion.',
      impact: 'Explain the consequence in player or owner terms, not just the technical label.',
      reproduction: 'Attach a safe scenario replay so a reviewer can verify the claim inside the range.',
      remediation: 'Suggest the security property that should hold; let the owner choose the implementation.',
    };
    return lessons[field] || 'Build the report from observable evidence, one claim at a time.';
  }
}

module.exports = { AthelgardBuilderBrain, BUILDER_STAGES };
