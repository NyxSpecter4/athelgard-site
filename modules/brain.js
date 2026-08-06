const BRAIN_VERSION = '1.0.0';
const HUNT = Object.freeze({ BLOCKED: 'blocked', NEEDS_SCOPE: 'needs_scope', INVESTIGATE: 'investigate', REPORT_READY: 'report_ready' });
const BUILDER = Object.freeze({ BOUNDARY: 'boundary', EVIDENCE: 'evidence', READY: 'ready' });

function evaluateHunt(a) {
  const s = a.scope||{}, e = a.evidence||{}, t = a.target||{};
  if (a.simulated !== true) return { status: HUNT.BLOCKED, reason: 'Non-simulated not permitted', timestamp: Date.now() };
  const r = ['program','authorized','inScope'], m = r.filter(k => !s[k]);
  if (m.length > 0 || !t.id) return { status: HUNT.NEEDS_SCOPE, missingScope: m, timestamp: Date.now() };
  const re = ['observation','impact','reproduction','remediation'], me = re.filter(k => !(typeof e[k]==='string'?e[k].trim().length>0:Boolean(e[k])));
  if (me.length > 0) return { status: HUNT.INVESTIGATE, missing: me, timestamp: Date.now() };
  return { status: HUNT.REPORT_READY, score: 100, verified: true, timestamp: Date.now() };
}

function reviewSubmission(a) {
  const s = a.scope||{}, e = a.evidence||{};
  if (!a.simulated || !s.authorized) return { stage: BUILDER.BOUNDARY, timestamp: Date.now() };
  const f = ['observation','impact','reproduction','remediation'], m = f.filter(x => !(typeof e[x]==='string'?e[x].trim().length>0:Boolean(e[x])));
  if (m.length > 0) return { stage: BUILDER.EVIDENCE, rubric: { score: Math.round((f.length - m.length) / f.length * 100), missing: m }, timestamp: Date.now() };
  return { stage: BUILDER.READY, rubric: { score: 100 }, timestamp: Date.now() };
}

const MENTORS = Object.freeze({
  ATHELGARD: { name: 'Athelgard', greeting: "Hi I am Athelgard your mentor and guide" },
  MELI: { name: 'MELI', greeting: "Security first. Let us verify before deploy" },
  MAKO: { name: 'MakoThoth-KClaw', greeting: "All systems operational. What is our next target" }
});

function getMentorResponse(c, q) {
  let key = 'ATHELGARD';
  if (c.gameMode === 'drone') key = 'DRONE_INSTRUCTOR';
  if (c.gameMode === 'hunt') key = 'CYBER_TRAINER';
  if (q && (q.includes('security') || q.includes('audit'))) key = 'MELI';
  const mentor = MENTORS[key] || MENTORS.ATHELGARD;
  return { mentor: mentor.name, response: mentor.greeting + '. ' + (q || 'What do you need?') };
}

const AthelgardBrain = {
  version: BRAIN_VERSION,
  process: async function(q, c={}) {
    const { type='general' } = c;
    switch(type) {
      case 'hunt': return evaluateHunt(c);
      case 'build': return reviewSubmission(c);
      case 'mentor': return getMentorResponse(c, q);
      default: return getMentorResponse(c, q);
    }
  },
  getStatus: function() { return { version: BRAIN_VERSION, timestamp: Date.now(), systems: { ethicalHuntLoop: 'OK', builderBrain: 'OK' } }; }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AthelgardBrain;
  module.exports.HUNT = HUNT;
  module.exports.BUILDER = BUILDER;
}
if (typeof window !== 'undefined') {
  window.AthelgardBrain = AthelgardBrain;
}