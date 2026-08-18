/**
 * SIMLI OWL — Expressive ASCII Art Avatar
 * 
 * A highly detailed, animated ASCII owl inspired by Simli's lifelike avatars.
 * Features: blinking, breathing, head tilts, emotional expressions
 * 
 * Usage:
 *   const owl = new SimliOwl();
 *   console.log(owl.render('neutral'));     // Static pose
 *   owl.animate('breathing', 5);             // 5 frames of breathing
 *   owl.setExpression('happy');
 *   console.log(owl.render());
 */

class SimliOwl {
  constructor(options = {}) {
    this.width = options.width || 60;
    this.height = options.height || 30;
    this.expression = options.expression || 'neutral';
    this.frame = 0;
    this.expressions = this._buildExpressions();
  }

  /**
   * Main render — returns current frame as string
   */
  render(expr = this.expression) {
    const frames = this.expressions[expr] || this.expressions['neutral'];
    const frameIndex = this.frame % frames.length;
    return frames[frameIndex];
  }

  /**
   * Set expression and reset frame counter
   */
  setExpression(expr) {
    if (!this.expressions[expr]) {
      console.warn(`Unknown expression: ${expr}. Using neutral.`);
      expr = 'neutral';
    }
    this.expression = expr;
    this.frame = 0;
  }

  /**
   * Animate — returns array of frames
   */
  animate(expr, count = 10) {
    const frames = [];
    const baseFrames = this.expressions[expr] || this.expressions['neutral'];
    
    for (let i = 0; i < count; i++) {
      this.frame = i;
      frames.push(baseFrames[i % baseFrames.length]);
    }
    return frames;
  }

  /**
   * Get all available expressions
   */
  getExpressions() {
    return Object.keys(this.expressions);
  }

  /**
   * Build all expression frames
   */
  _buildExpressions() {
    const owlNeutral = `                    ___  ___
                 .-'   ''   '-.
               .'    .-""-.    '.
              /     /      \\     \\
             |     |  o  o  |     |
             |      \\  \\/\\/  /      |
              \\      '-....-'      /
               '.    _|""|_    .'
                 '-.'  ||  '.-'
                     ' || '
                       ||
                       ||
                       /\\
                      /  \\
                     '    '`;

    const owlHappy = `                    ___  ___
                 .-'   ^^   '-.
               .'    .-""-.    '.
              /     /      \\     \\
             |     |  ^  ^  |     |
             |      \\  \\\\//  /      |
              \\      '-....-'      /
               '.    _|""|_    .'
                 '-.'  ||  '.-'
                     ' || '
                      \\||/
                       \\/
                       /\\
                      /  \\
                     '    '`;

    const owlFocus = `                    ___  ___
                 .-'   ''   '-.
               .'    .-""-.    '.
              /     /  ||  \\     \\
             |     |  o  o  |     |
             |      \\  |''|  /      |
              \\      '-====-'      /
               '.    _|""|_    .'
                 '-.'  ||  '.-'
                     ' || '
                       ||
                       ||
                       /\\
                      /  \\
                     '    '`;

    const owlCurious = `                    ___  ___
                 .-'   ''   '-.
               .'    .-""-.    '.
              /     /      \\     \\
             |     |  o  ?  |     |
             |      \\  \\/   /      |
              \\      '-....-'      /
               '.    _|""|_    .'
                 '-.'  ||  '.-'
                   '  ||  '
                     ||
                     ||
                     /\\
                    /  \\
                   '    '`;

    const owlAlert = `                    ___  ___
                 .-'   !!   '-.
               .'    .-""-.    '.
              /     /      \\     \\
             |     |  O  O  |     |
             |      \\  |||  /      |
              \\      '-....-'      /
               '.    _|""|_    .'
                 '-.'  ||  '.-'
                     ' || '
                       ||
                       ||
                       /\\
                      /  \\
                     '    '`;

    const owlSleepy = `                    ___  ___
                 .-'   ~~   '-.
               .'    .-""-.    '.
              /     /      \\     \\
             |     |  -  -  |     |
             |      \\  ~~~~  /      |
              \\      '-....-'      /
               '.    _|""|_    .'
                 '-.'  ||  '.-'
                     ' || '
                       ||
                       ||
                       /\\
                      /  \\
                     '    '`;

    const owlWink = `                    ___  ___
                 .-'   ^^   '-.
               .'    .-""-.    '.
              /     /      \\     \\
             |     |  ^  -  |     |
             |      \\  \\\\/  /      |
              \\      '-....-'      /
               '.    _|""|_    .'
                 '-.'  ||  '.-'
                     ' || '
                       ||
                       ||
                       /\\
                      /  \\
                     '    '`;

    const owlWise = `                    ___  ___
                 .-'   ''   '-.
               .'    .-""-.    '.
              /     /  ==  \\     \\
             |     |  o  o  |     |
             |      \\  ==  /      |
              \\      '-....-'      /
               '.    _|""|_    .'
                 '-.'  ||  '.-'
                     ' || '
                       ||
                       ||
                       /\\
                      /  \\
                     '    '`;

    const owlHypno = `                    ___  ___
                 .-'   **   '-.
               .'    .-""-.    '.
              /     /      \\     \\
             |     |  @  @  |     |
             |      \\  \\/\\/  /      |
              \\      '-....-'      /
               '.    _|""|_    .'
                 '-.'  ||  '.-'
                     ' || '
                       ||
                       ||
                       /\\
                      /  \\
                     '    '`;

    return {
      neutral: [owlNeutral, owlNeutral.replace('o  o', '-  -')],
      happy: [owlHappy, owlHappy.replace('^  ^', '^  ^').replace('\\||/', ' || ')],
      focus: [owlFocus, owlFocus.replace('o  o', '-  -')],
      curious: [owlCurious, owlCurious.replace('o  ?', 'o  ?').replace("'  ||  '", "' || '")],
      alert: [owlAlert, owlAlert.replace('O  O', 'O  O')],
      sleepy: [owlSleepy, owlSleepy.replace('-  -', '-  -')],
      wink: [owlWink],
      wise: [owlWise],
      hypno: [owlHypno, owlHypno.replace('@  @', '~  ~')],
    };
  }

  /**
   * Create a greeting message with the owl
   */
  greet(name = 'hunter') {
    const owl = this.render('happy');
    return `
${owl}

    ╔══════════════════════════════════════════╗
    ║  🦉 "Greetings, ${name}!"                    ║
    ║                                          ║
    ║  I am Athelgard, your owl guide.         ║
    ║  The London range awaits.                ║
    ╚══════════════════════════════════════════╝
`;
  }

  /**
   * Create a terminal-style banner
   */
  banner() {
    return `
    ╔═══════════════════════════════════════════════════════╗
    ║                                                       ║
    ║     🦉 ATHELGARD — Ethical Bounty Training            ║
    ║                                                       ║
    ║     "See what others miss. Report what you find."     ║
    ║                                                       ║
    ╚═══════════════════════════════════════════════════════╝

${this.render('neutral')}
`;
  }

  /**
   * Export as HTML with animation CSS
   */
  toHTML(expr = 'neutral', options = {}) {
    const frames = this.expressions[expr] || this.expressions['neutral'];
    const fps = options.fps || 2;
    const id = 'owl-' + Math.random().toString(36).slice(2, 8);
    
    const frameData = frames.map((f, i) => 
      `<pre class="owl-frame" data-frame="${i}" style="display:${i===0?'block':'none'}">${f}</pre>`
    ).join('\n');

    return `
<style>
#${id} { font-family: monospace; line-height: 1.2; color: var(--cyan, #12e0ff); text-align: center; }
#${id} pre { margin: 0; white-space: pre; }
</style>
<div id="${id}">
${frameData}
</div>
<script>
(function(){
  const container = document.getElementById('${id}');
  const frames = container.querySelectorAll('.owl-frame');
  let current = 0;
  setInterval(() => {
    frames[current].style.display = 'none';
    current = (current + 1) % frames.length;
    frames[current].style.display = 'block';
  }, ${1000 / fps});
})();
<\/script>`;
  }
}

// ─── EXPORT ───
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SimliOwl };
}
if (typeof window !== 'undefined') {
  window.SimliOwl = SimliOwl;
}
