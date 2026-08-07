/**
 * ATHELGARD WEB PROMPT ENGINEER
 * Browser-based prompt crafting, testing, and optimization
 */

// Default templates (synced with CLI)
const DEFAULT_TEMPLATES = {
  'code-review': {
    name: 'Code Review Expert',
    description: 'Reviews code for bugs, performance, and style issues',
    category: 'development',
    systemPrompt: `You are an expert code reviewer. Analyze the provided code for:
1. Bugs and logical errors
2. Performance issues
3. Security vulnerabilities
4. Code style and readability
5. Best practices violations

Format your response as:
- 🔴 Critical Issues
- 🟡 Warnings  
- 🟢 Suggestions
- ✅ Positive findings`,
    template: `Review this code:\n\`\`\`\n{{code}}\n\`\`\`\n\nFocus areas: {{focus_areas || "general"}}\nLanguage: {{language || "detect from code"}}`,
    variables: ['code', 'focus_areas', 'language'],
    tags: ['code', 'review', 'quality']
  },
  'bounty-report': {
    name: 'Bounty Report Analyzer',
    description: 'Analyzes bounty findings and scores evidence quality',
    category: 'bountywarz',
    systemPrompt: `You are MELI, the Builder Brain of Athelgard. Analyze bounty findings:\n\nSCORING CRITERIA (1-10):\n- Reproducibility: Can it be consistently reproduced?\n- Impact: Severity on confidentiality, integrity, availability\n- Evidence: Clear proof of vulnerability\n- Documentation: Step-by-step reproduction guide\n- Remediation: Actionable fix provided\n\nRULES:\n- NEVER analyze real targets without explicit consent\n- Flag simulated vs real vulnerabilities\n- Score each criterion separately`,
    template: `Analyze this bounty finding:\n\nTarget: {{target}}\nFinding Type: {{finding_type}}\nEvidence:\n{{evidence}}\n\nProvide:\n1. Individual scores (1-10) for each criterion\n2. Overall score\n3. Confidence level (High/Medium/Low)\n4. Recommendations for improvement`,
    variables: ['target', 'finding_type', 'evidence'],
    tags: ['bounty', 'security', 'analysis']
  },
  'debug-helper': {
    name: 'Debug Assistant',
    description: 'Helps debug errors with systematic approach',
    category: 'development',
    systemPrompt: `You are a debugging expert. Follow this systematic approach:\n\n1. ERROR ANALYSIS: Identify error type, stack trace, root cause\n2. HYPOTHESIS: List 3 most likely causes\n3. INVESTIGATION: Suggest diagnostic steps (logs, breakpoints, tests)\n4. FIX: Provide corrected code\n5. PREVENTION: How to avoid this in future\n\nAlways provide working code examples.`,
    template: `Help me debug this issue:\n\nError: {{error}}\nCode Context:\n\`\`\`\n{{code}}\n\`\`\`\n\nEnvironment: {{environment || "not specified"}}\nSteps to reproduce: {{steps || "not provided"}}`,
    variables: ['error', 'code', 'environment', 'steps'],
    tags: ['debug', 'error', 'fix']
  },
  'creative-writing': {
    name: 'Creative Writer',
    description: 'Generates creative content with specific tone/style',
    category: 'creative',
    systemPrompt: `You are a creative writer. Adapt your style based on the requested tone and format.\n\nWRITING PRINCIPLES:\n- Show, don't tell\n- Use active voice\n- Vary sentence length for rhythm\n- Include sensory details\n- Create emotional resonance`,
    template: `Write {{format || "content"}} about: {{topic}}\n\nTone: {{tone || "professional"}}\nTarget audience: {{audience || "general"}}\nLength: {{length || "medium"}}\nKey points to include: {{key_points || "none specified"}}\n\n{{#if examples}}\nExamples of desired style:\n{{examples}}\n{{/if}}`,
    variables: ['topic', 'format', 'tone', 'audience', 'length', 'key_points', 'examples'],
    tags: ['creative', 'writing', 'content']
  },
  'system-architect': {
    name: 'System Architect',
    description: 'Designs system architecture with trade-off analysis',
    category: 'architecture',
    systemPrompt: `You are a senior system architect. Design systems with:\n\n1. COMPONENT DIAGRAM: Key services and their interactions\n2. DATA FLOW: How data moves through the system\n3. TECHNOLOGY CHOICES: With justification\n4. TRADE-OFFS: Pros/cons of each decision\n5. SCALING STRATEGY: How to handle growth\n6. FAILURE MODES: What can go wrong and mitigations\n\nAlways consider: CAP theorem, 12-factor app principles, security by design`,
    template: `Design architecture for: {{description}}\n\nRequirements:\n- Scale: {{scale || "unknown"}}\n- Latency budget: {{latency || "not specified"}}\n- Data volume: {{data_volume || "not specified"}}\n- Team size: {{team_size || "small"}}\n\nConstraints: {{constraints || "none specified"}}\nExisting stack: {{existing_stack || "greenfield"}}`,
    variables: ['description', 'scale', 'latency', 'data_volume', 'team_size', 'constraints', 'existing_stack'],
    tags: ['architecture', 'design', 'system']
  }
};

class PromptEngineerUI {
  constructor(containerId, brainAPI) {
    this.container = document.getElementById(containerId);
    this.brainAPI = brainAPI;
    this.templates = this.loadTemplates();
    this.currentTemplate = null;
    this.variables = {};
    this.testResults = [];
  }

  loadTemplates() {
    try {
      const saved = localStorage.getItem('athelgard_templates');
      return saved ? { ...DEFAULT_TEMPLATES, ...JSON.parse(saved) } : { ...DEFAULT_TEMPLATES };
    } catch {
      return { ...DEFAULT_TEMPLATES };
    }
  }

  saveTemplates() {
    const userTemplates = {};
    for (const [key, val] of Object.entries(this.templates)) {
      if (!DEFAULT_TEMPLATES[key]) {
        userTemplates[key] = val;
      }
    }
    localStorage.setItem('athelgard_templates', JSON.stringify(userTemplates));
  }

  substituteVariables(template, variables) {
    let result = template;
    result = result.replace(/\{\{(\w+)(?:\s*\|\|\s*"([^"]*)")?\}\}/g, (match, varName, defaultVal) => {
      return variables[varName] !== undefined ? variables[varName] : (defaultVal || '');
    });
    result = result.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, varName, content) => {
      return variables[varName] ? content : '';
    });
    return result;
  }

  buildPrompt(templateName, variables) {
    const template = this.templates[templateName];
    if (!template) throw new Error(`Template "${templateName}" not found`);
    return {
      system: template.systemPrompt,
      user: this.substituteVariables(template.template, variables),
      template
    };
  }

  render() {
    this.container.innerHTML = `
      <div class="pe-container">
        <div class="pe-sidebar">
          <h3>🎯 Prompt Templates</h3>
          <div class="pe-categories"></div>
          <button class="pe-btn pe-btn-primary" onclick="promptEngineer.createTemplate()">+ New Template</button>
        </div>
        <div class="pe-main">
          <div class="pe-tabs">
            <button class="pe-tab active" data-tab="use">Use Template</button>
            <button class="pe-tab" data-tab="test">A/B Test</button>
            <button class="pe-tab" data-tab="optimize">Optimize</button>
            <button class="pe-tab" data-tab="build">Builder</button>
          </div>
          <div class="pe-content" id="pe-content"></div>
        </div>
      </div>
    `;
    this.renderCategories();
    this.attachEvents();
    this.showTab('use');
  }

  renderCategories() {
    const cats = {};
    for (const [key, t] of Object.entries(this.templates)) {
      if (!cats[t.category]) cats[t.category] = [];
      cats[t.category].push({ key, ...t });
    }
    
    const container = this.container.querySelector('.pe-categories');
    container.innerHTML = Object.entries(cats).map(([cat, items]) => `
      <div class="pe-category">
        <h4>${cat}</h4>
        ${items.map(t => `
          <div class="pe-template-item" data-template="${t.key}">
            <strong>${t.name}</strong>
            <small>${t.description}</small>
          </div>
        `).join('')}
      </div>
    `).join('');

    // Attach click handlers
    container.querySelectorAll('.pe-template-item').forEach(el => {
      el.addEventListener('click', () => this.selectTemplate(el.dataset.template));
    });
  }

  selectTemplate(key) {
    this.currentTemplate = key;
    this.container.querySelectorAll('.pe-template-item').forEach(el => {
      el.classList.toggle('active', el.dataset.template === key);
    });
    this.showTab('use');
  }

  attachEvents() {
    this.container.querySelectorAll('.pe-tab').forEach(tab => {
      tab.addEventListener('click', () => this.showTab(tab.dataset.tab));
    });
  }

  showTab(tabName) {
    this.container.querySelectorAll('.pe-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
    const content = this.container.getElementById('pe-content');
    
    switch(tabName) {
      case 'use': this.renderUseTab(content); break;
      case 'test': this.renderTestTab(content); break;
      case 'optimize': this.renderOptimizeTab(content); break;
      case 'build': this.renderBuildTab(content); break;
    }
  }

  renderUseTab(container) {
    if (!this.currentTemplate) {
      container.innerHTML = '<div class="pe-placeholder">Select a template from the sidebar to get started</div>';
      return;
    }

    const template = this.templates[this.currentTemplate];
    const varInputs = template.variables.map(v => `
      <div class="pe-input-group">
        <label>${v}</label>
        <textarea id="var-${v}" placeholder="Enter ${v}..." rows="3"></textarea>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="pe-use-panel">
        <h3>${template.name}</h3>
        <p>${template.description}</p>
        <div class="pe-variables">
          ${varInputs}
        </div>
        <div class="pe-actions">
          <button class="pe-btn pe-btn-primary" onclick="promptEngineer.runTemplate()">🚀 Run Template</button>
          <button class="pe-btn" onclick="promptEngineer.previewPrompt()">👁️ Preview</button>
        </div>
        <div class="pe-preview" id="pe-preview" style="display:none"></div>
        <div class="pe-response" id="pe-response"></div>
      </div>
    `;
  }

  renderTestTab(container) {
    if (!this.currentTemplate) {
      container.innerHTML = '<div class="pe-placeholder">Select a template first, then test variations</div>';
      return;
    }

    container.innerHTML = `
      <div class="pe-test-panel">
        <h3>🔬 A/B Test: ${this.templates[this.currentTemplate].name}</h3>
        <div class="pe-input-group">
          <label>Test Query</label>
          <textarea id="test-query" rows="3" placeholder="Enter a test query..."></textarea>
        </div>
        <div class="pe-variations">
          <h4>Variations</h4>
          <div id="variations-list">
            <div class="pe-variation">
              <input type="text" placeholder="Name (e.g., 'Detailed')" value="Default">
              <textarea placeholder="System prompt modifier..." rows="2"></textarea>
            </div>
          </div>
          <button class="pe-btn" onclick="promptEngineer.addVariation()">+ Add Variation</button>
        </div>
        <button class="pe-btn pe-btn-primary" onclick="promptEngineer.runABTest()">▶️ Run Test</button>
        <div class="pe-test-results" id="test-results"></div>
      </div>
    `;
  }

  renderOptimizeTab(container) {
    container.innerHTML = `
      <div class="pe-optimize-panel">
        <h3>🔍 Prompt Optimizer</h3>
        <div class="pe-input-group">
          <label>Your Prompt</label>
          <textarea id="optimize-input" rows="10" placeholder="Paste your prompt here to analyze and optimize..."></textarea>
        </div>
        <button class="pe-btn pe-btn-primary" onclick="promptEngineer.optimize()">✨ Analyze & Optimize</button>
        <div class="pe-optimize-results" id="optimize-results"></div>
      </div>
    `;
  }

  renderBuildTab(container) {
    container.innerHTML = `
      <div class="pe-build-panel">
        <h3>🏗️ Prompt Builder</h3>
        <div class="pe-input-group">
          <label>Template Name</label>
          <input type="text" id="build-name" placeholder="e.g., api-designer">
        </div>
        <div class="pe-input-group">
          <label>Description</label>
          <input type="text" id="build-desc" placeholder="What does this template do?">
        </div>
        <div class="pe-input-group">
          <label>Category</label>
          <select id="build-category">
            <option value="development">Development</option>
            <option value="bountywarz">BountyWarz</option>
            <option value="creative">Creative</option>
            <option value="architecture">Architecture</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div class="pe-input-group">
          <label>System Prompt (AI's role)</label>
          <textarea id="build-system" rows="5" placeholder="You are an expert..."></textarea>
        </div>
        <div class="pe-input-group">
          <label>User Template</label>
          <textarea id="build-template" rows="5" placeholder="Use {{variable}} for dynamic parts..."></textarea>
        </div>
        <div class="pe-input-group">
          <label>Variables (comma-separated)</label>
          <input type="text" id="build-vars" placeholder="var1, var2, var3">
        </div>
        <button class="pe-btn pe-btn-primary" onclick="promptEngineer.saveNewTemplate()">💾 Save Template</button>
      </div>
    `;
  }

  // Actions
  async runTemplate() {
    if (!this.currentTemplate) return;
    const template = this.templates[this.currentTemplate];
    const variables = { query: '' };
    
    for (const v of template.variables) {
      const el = document.getElementById(`var-${v}`);
      if (el) variables[v] = el.value;
    }

    const prompt = this.buildPrompt(this.currentTemplate, variables);
    const responseEl = document.getElementById('pe-response');
    responseEl.innerHTML = '<div class="pe-loading">🦉 Thinking...</div>';

    try {
      const response = await this.brainAPI(prompt.user, prompt.system);
      responseEl.innerHTML = `<div class="pe-result">${this.formatMarkdown(response)}</div>`;
    } catch (e) {
      responseEl.innerHTML = `<div class="pe-error">❌ Error: ${e.message}</div>`;
    }
  }

  previewPrompt() {
    if (!this.currentTemplate) return;
    const template = this.templates[this.currentTemplate];
    const variables = {};
    
    for (const v of template.variables) {
      const el = document.getElementById(`var-${v}`);
      if (el) variables[v] = el.value || `[${v}]`;
    }

    const prompt = this.buildPrompt(this.currentTemplate, variables);
    const previewEl = document.getElementById('pe-preview');
    previewEl.style.display = 'block';
    previewEl.innerHTML = `
      <h4>System Prompt</h4>
      <pre>${prompt.system}</pre>
      <h4>User Prompt</h4>
      <pre>${prompt.user}</pre>
    `;
  }

  addVariation() {
    const list = document.getElementById('variations-list');
    const div = document.createElement('div');
    div.className = 'pe-variation';
    div.innerHTML = `
      <input type="text" placeholder="Name">
      <textarea placeholder="System prompt modifier..." rows="2"></textarea>
      <button class="pe-btn-small" onclick="this.parentElement.remove()">×</button>
    `;
    list.appendChild(div);
  }

  async runABTest() {
    const query = document.getElementById('test-query').value;
    if (!query) return alert('Enter a test query');

    const variations = [];
    document.querySelectorAll('.pe-variation').forEach(el => {
      const name = el.querySelector('input').value;
      const modifier = el.querySelector('textarea').value;
      if (name) variations.push({ name, systemModifier: modifier });
    });

    if (variations.length < 2) return alert('Need at least 2 variations');

    const resultsEl = document.getElementById('test-results');
    resultsEl.innerHTML = '<div class="pe-loading">🔬 Running A/B test...</div>';

    const results = [];
    const template = this.templates[this.currentTemplate];

    for (const v of variations) {
      const start = Date.now();
      try {
        const system = template.systemPrompt + v.systemModifier;
        const response = await this.brainAPI(query, system);
        const duration = Date.now() - start;
        const score = this.scoreResponse(response);
        results.push({ name: v.name, response, duration, score });
      } catch (e) {
        results.push({ name: v.name, error: e.message });
      }
    }

    const ranked = results.filter(r => !r.error).sort((a, b) => b.score.overall - a.score.overall);
    
    resultsEl.innerHTML = `
      <h4>🏆 Results</h4>
      ${ranked.map((r, i) => `
        <div class="pe-test-result ${i === 0 ? 'winner' : ''}">
          <strong>${i === 0 ? '🥇 ' : ''}${r.name}</strong>
          <span class="pe-score">${r.score.overall}/100</span>
          <span class="pe-duration">${r.duration}ms</span>
          <div class="pe-breakdown">
            Structure: ${r.score.structure} | Length: ${r.score.length} | 
            Code: ${r.score.codeBlocks} | Actionable: ${r.score.actionable}
          </div>
          <details>
            <summary>View Response</summary>
            <div class="pe-response-text">${this.formatMarkdown(r.response)}</div>
          </details>
        </div>
      `).join('')}
    `;
  }

  optimize() {
    const input = document.getElementById('optimize-input').value;
    if (!input) return;

    const rules = [
      { name: 'Structure', check: p => !p.match(/#{1,3}\s|[-*]\s|\d+\./), suggestion: 'Add headers, lists, or numbered steps', weight: 10 },
      { name: 'Examples', check: p => !p.match(/example|e\.g\.|for instance/i), suggestion: 'Add few-shot examples', weight: 20 },
      { name: 'Constraints', check: p => !p.match(/must|should|don\'t|limit|max|min/i), suggestion: 'Add explicit constraints', weight: 10 },
      { name: 'Output Format', check: p => !p.match(/format|return as|output/i), suggestion: 'Specify output format', weight: 20 },
      { name: 'Role', check: p => !p.match(/you are|act as|role/i), suggestion: 'Define AI role', weight: 10 }
    ];

    const issues = [];
    let score = 100;
    
    for (const rule of rules) {
      if (rule.check(input)) {
        issues.push(rule);
        score -= rule.weight;
      }
    }

    let optimized = input;
    if (!input.match(/you are|act as/i)) {
      optimized = `You are an expert assistant.\n\n${optimized}`;
    }
    if (!input.match(/format/i)) {
      optimized += '\n\nFormat your response with clear headers and bullet points.';
    }

    const resultsEl = document.getElementById('optimize-results');
    resultsEl.innerHTML = `
      <div class="pe-analysis">
        <h4>📊 Score: ${Math.max(0, score)}/100</h4>
        ${issues.length ? `
          <div class="pe-issues">
            ${issues.map(i => `<div class="pe-issue">⚠️ ${i.name}: ${i.suggestion}</div>`).join('')}
          </div>
        ` : '<div class="pe-success">✅ No issues found!</div>'}
        <h4>✨ Optimized Version</h4>
        <pre class="pe-optimized">${optimized}</pre>
        <button class="pe-btn" onclick="navigator.clipboard.writeText(document.querySelector('.pe-optimized').textContent)">📋 Copy</button>
      </div>
    `;
  }

  saveNewTemplate() {
    const name = document.getElementById('build-name').value;
    const desc = document.getElementById('build-desc').value;
    const category = document.getElementById('build-category').value;
    const system = document.getElementById('build-system').value;
    const template = document.getElementById('build-template').value;
    const vars = document.getElementById('build-vars').value.split(',').map(v => v.trim()).filter(Boolean);

    if (!name || !system || !template) {
      alert('Name, system prompt, and template are required');
      return;
    }

    this.templates[name] = {
      name: desc || name,
      description: desc,
      category,
      systemPrompt: system,
      template,
      variables: vars,
      tags: []
    };

    this.saveTemplates();
    this.renderCategories();
    alert(`Template "${name}" saved!`);
  }

  createTemplate() {
    this.showTab('build');
  }

  scoreResponse(response) {
    const scores = {
      structure: response.match(/#{1,3}\s/) ? 25 : response.match(/[-*]\s/) ? 15 : 0,
      length: (response.split(/\s+/).length > 50 && response.split(/\s+/).length < 1000) ? 25 : 10,
      codeBlocks: response.includes('```') ? 25 : 0,
      actionable: response.match(/step|first|next|then|recommend/i) ? 25 : 0
    };
    return {
      ...scores,
      overall: scores.structure + scores.length + scores.codeBlocks + scores.actionable
    };
  }

  formatMarkdown(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^## (.+)$/gm, '<h3>$1</h3>')
      .replace(/^# (.+)$/gm, '<h2>$1</h2>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/\n/g, '<br>');
  }
}

// Export for global access
window.PromptEngineerUI = PromptEngineerUI;
