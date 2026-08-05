// modules/games.js — Code Jeopardy & Wheel of Fortune
export const JEOPARDY_DATA = [
  { cat: 'JavaScript', q: [
    { q: 'What is the result of [] + []?', a: 'empty string', pts: 100 },
    { q: 'What does typeof null return?', a: 'object', pts: 200 },
    { q: 'What is NaN === NaN?', a: 'false', pts: 300 },
    { q: 'What does [1,2,3].map(parseInt) return?', a: '[1, NaN, NaN]', pts: 400 },
  ]},
  { cat: 'CSS', q: [
    { q: 'What does display: flex do?', a: 'flexbox', pts: 100 },
    { q: 'What unit is relative to parent font size?', a: 'em', pts: 200 },
    { q: 'What pseudo-element clears floats?', a: 'clearfix', pts: 300 },
    { q: 'What creates a new stacking context?', a: 'z-index', pts: 400 },
  ]},
  { cat: 'HTTP', q: [
    { q: 'What does status 200 mean?', a: 'ok', pts: 100 },
    { q: 'What does CORS stand for?', a: 'cross origin resource sharing', pts: 200 },
    { q: 'What method is idempotent?', a: 'put', pts: 300 },
    { q: 'What header prevents MIME sniffing?', a: 'x-content-type-options', pts: 400 },
  ]},
  { cat: 'React', q: [
    { q: 'What hook manages state?', a: 'usestate', pts: 100 },
    { q: 'What hook runs after render?', a: 'useeffect', pts: 200 },
    { q: 'What prevents unnecessary re-renders?', a: 'memo', pts: 300 },
    { q: 'What is the virtual DOM?', a: 'lightweight copy', pts: 400 },
  ]},
  { cat: 'Security', q: [
    { q: 'What does XSS stand for?', a: 'cross site scripting', pts: 100 },
    { q: 'What does CSRF exploit?', a: 'session', pts: 200 },
    { q: 'What header enables CSP?', a: 'content-security-policy', pts: 300 },
    { q: 'What encoding prevents XSS?', a: 'html entities', pts: 400 },
  ]},
  { cat: 'DevOps', q: [
    { q: 'What does CI/CD stand for?', a: 'continuous integration continuous deployment', pts: 100 },
    { q: 'What tool containerizes apps?', a: 'docker', pts: 200 },
    { q: 'What orchestrates containers?', a: 'kubernetes', pts: 300 },
    { q: 'What is infrastructure as code?', a: 'terraform', pts: 400 },
  ]},
];

export const WHEEL_PRIZES = [
  '💻 Code Review',
  '🎯 Debug Session',
  '🎤 Voice Explain',
  '💡 Architecture Tip',
  '🐛 Find the Bug',
  '⚡ Performance Hack',
  '📚 Learn a Pattern',
  '🏆 Bonus XP',
];

let jeopardyScore = 0;
let wheelSpinning = false;

export function getJeopardyScore() { return jeopardyScore; }
export function addJeopardyScore(pts) { jeopardyScore += pts; }
export function resetJeopardyScore() { jeopardyScore = 0; }

export function getWheelPrizes() { return WHEEL_PRIZES; }
export function isWheelSpinning() { return wheelSpinning; }
export function setWheelSpinning(v) { wheelSpinning = v; }
