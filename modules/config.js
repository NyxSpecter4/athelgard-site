// modules/config.js — Central configuration & constants
export const CONFIG = {
  get deepseekKey()  { return localStorage.getItem('athelgard_api_key') || ''; },
  get kimiKey()      { return localStorage.getItem('athelgard_kimi_key') || ''; },
  get githubToken()  { return localStorage.getItem('athelgard_github_key') || ''; },
  set deepseekKey(v) { localStorage.setItem('athelgard_api_key', v); },
  set kimiKey(v)     { localStorage.setItem('athelgard_kimi_key', v); },
  set githubToken(v) { localStorage.setItem('athelgard_github_key', v); },

  version: '6.0',
  name: 'Athelgard',
  isPeakHour() {
    const pst = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
    const hour = new Date(pst).getHours();
    return hour >= 9 && hour < 21;
  }
};

export const MELI = {
  HUNT_DECISIONS: Object.freeze({
    BLOCKED: 'blocked',
    NEEDS_SCOPE: 'needs_scope',
    INVESTIGATE: 'investigate',
    REPORT_READY: 'report_ready',
  }),

  BUILDER_STAGES: Object.freeze({
    BOUNDARY: 'boundary',
    EVIDENCE: 'evidence',
    REVIEW: 'review',
    READY: 'ready',
  }),

  EVIDENCE_FIELDS: Object.freeze(['observation', 'impact', 'reproduction', 'remediation']),
  REPORT_EVIDENCE: Object.freeze(['observation', 'impact', 'reproduction', 'remediation']),
};
