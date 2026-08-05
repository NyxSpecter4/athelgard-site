/**
 * GitHub API Client for Browser
 * Full read/write access for Athelgard coding agent
 */

class GitHubClient {
  constructor(token = null) {
    this.token = token;
    this.base = 'https://api.github.com';
    this.enabled = !!token;
    this.repoMetaCache = new Map();
  }

  setToken(token) {
    this.token = token;
    this.enabled = !!token;
  }

  async _request(endpoint, method = 'GET', data = null) {
    if (!this.enabled) {
      throw new Error('GitHub token not set. Add it in Settings.');
    }

    const url = `${this.base}${endpoint}`;
    const headers = {
      'Authorization': `token ${this.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Athelgard-Agent'
    };

    const options = { method, headers };
    if (data) {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`GitHub API Error: ${response.status} ${error.message || ''}`);
    }

    // Handle 204 No Content
    if (response.status === 204) return { success: true };
    
    return response.json();
  }

  _repoCacheKey(owner, repo) {
    return `${owner}/${repo}`;
  }

  async resolveDefaultBranch(owner, repo, fallback = 'main') {
    const cacheKey = this._repoCacheKey(owner, repo);
    if (this.repoMetaCache.has(cacheKey)) {
      return this.repoMetaCache.get(cacheKey).default_branch || fallback;
    }

    try {
      const repoInfo = await this.getRepo(owner, repo);
      this.repoMetaCache.set(cacheKey, repoInfo);
      return repoInfo.default_branch || fallback;
    } catch (err) {
      return fallback;
    }
  }

  async _resolveBranch(owner, repo, branch = null, fallback = 'main') {
    if (branch && branch.trim()) {
      return branch;
    }
    return this.resolveDefaultBranch(owner, repo, fallback);
  }

  _encodeBase64Utf8(content) {
    return btoa(unescape(encodeURIComponent(content)));
  }

  _decodeBase64Utf8(content) {
    return decodeURIComponent(escape(atob(content.replace(/\s/g, ''))));
  }

  // ─── Repository Operations ─────────────────────────────────────

  async getRepo(owner, repo) {
    return this._request(`/repos/${owner}/${repo}`);
  }

  async listRepos(owner, perPage = 30) {
    return this._request(`/users/${owner}/repos?per_page=${perPage}`);
  }

  async getFile(owner, repo, path, ref = null) {
    const resolvedRef = await this._resolveBranch(owner, repo, ref);
    const result = await this._request(`/repos/${owner}/${repo}/contents/${path}?ref=${resolvedRef}`);
    if (result.content) {
      try {
        result.decodedContent = this._decodeBase64Utf8(result.content);
      } catch (e) {
        try {
          result.decodedContent = atob(result.content.replace(/\s/g, ''));
        } catch (inner) {
          result.decodedContent = '[Binary file]';
        }
      }
    }
    result.ref = resolvedRef;
    return result;
  }

  async listDirectory(owner, repo, path = '', ref = null) {
    const resolvedRef = await this._resolveBranch(owner, repo, ref);
    return this._request(`/repos/${owner}/${repo}/contents/${path}?ref=${resolvedRef}`);
  }

  async getReadme(owner, repo, ref = null) {
    return this.getFile(owner, repo, 'README.md', ref);
  }

  // ─── WRITE OPERATIONS ───────────────────────────────────────────

  async createOrUpdateFile(owner, repo, path, content, message, sha = null, branch = null) {
    const resolvedBranch = await this._resolveBranch(owner, repo, branch);
    const data = {
      message: message || `Update ${path} via Athelgard`,
      content: this._encodeBase64Utf8(content),
      branch: resolvedBranch
    };
    if (sha) {
      data.sha = sha;
    }
    return this._request(`/repos/${owner}/${repo}/contents/${path}`, 'PUT', data);
  }

  async createFile(owner, repo, path, content, message, branch = null) {
    return this.createOrUpdateFile(owner, repo, path, content, message, null, branch);
  }

  async updateFile(owner, repo, path, content, message, sha, branch = null) {
    return this.createOrUpdateFile(owner, repo, path, content, message, sha, branch);
  }

  async deleteFile(owner, repo, path, sha, message, branch = null) {
    const resolvedBranch = await this._resolveBranch(owner, repo, branch);
    return this._request(`/repos/${owner}/${repo}/contents/${path}`, 'DELETE', {
      message: message || `Delete ${path} via Athelgard`,
      sha: sha,
      branch: resolvedBranch
    });
  }

  async createBranch(owner, repo, newBranch, fromBranch = null) {
    const sourceBranch = await this._resolveBranch(owner, repo, fromBranch);

    // Get the SHA of the latest commit on the source branch
    const ref = await this._request(`/repos/${owner}/${repo}/git/refs/heads/${sourceBranch}`);
    const sha = ref.object.sha;
    
    return this._request(`/repos/${owner}/${repo}/git/refs`, 'POST', {
      ref: `refs/heads/${newBranch}`,
      sha: sha
    });
  }

  async createPullRequest(owner, repo, title, head, base = null, body = '') {
    const resolvedBase = await this._resolveBranch(owner, repo, base);
    return this._request(`/repos/${owner}/${repo}/pulls`, 'POST', {
      title: title,
      head: head,
      base: resolvedBase,
      body: body || `Created by Athelgard`
    });
  }

  // ─── Issues & PRs ───────────────────────────────────────────────

  async listIssues(owner, repo, state = 'open', perPage = 30) {
    return this._request(`/repos/${owner}/${repo}/issues?state=${state}&per_page=${perPage}`);
  }

  async listPullRequests(owner, repo, state = 'open') {
    return this._request(`/repos/${owner}/${repo}/pulls?state=${state}`);
  }

  // ─── Commits ────────────────────────────────────────────────────

  async listCommits(owner, repo, perPage = 30) {
    return this._request(`/repos/${owner}/${repo}/commits?per_page=${perPage}`);
  }

  async getCommit(owner, repo, sha) {
    return this._request(`/repos/${owner}/${repo}/commits/${sha}`);
  }

  // ─── Actions ────────────────────────────────────────────────────

  async listWorkflows(owner, repo) {
    return this._request(`/repos/${owner}/${repo}/actions/workflows`);
  }

  // ─── Health Check ───────────────────────────────────────────────

  async healthCheck() {
    try {
      const user = await this._request('/user');
      return {
        status: 'connected',
        user: user.login,
        name: user.name,
        repos: user.public_repos
      };
    } catch (err) {
      return { status: 'error', error: err.message };
    }
  }

  // ─── Smart Operations ───────────────────────────────────────────

  async analyzeRepo(owner, repo) {
    const [repoInfo, rootFiles, readme] = await Promise.all([
      this.getRepo(owner, repo),
      this.listDirectory(owner, repo),
      this.getReadme(owner, repo).catch(() => null)
    ]);

    return {
      name: repoInfo.name,
      description: repoInfo.description,
      language: repoInfo.language,
      stars: repoInfo.stargazers_count,
      forks: repoInfo.forks_count,
      topics: repoInfo.topics || [],
      license: repoInfo.license?.name,
      defaultBranch: repoInfo.default_branch,
      lastUpdated: repoInfo.updated_at,
      rootFiles: Array.isArray(rootFiles) ? rootFiles.map(f => ({
        name: f.name,
        type: f.type,
        size: f.size
      })) : [],
      readmePreview: readme?.decodedContent?.substring(0, 500) || null
    };
  }

  async getRecentActivity(owner, repo, days = 7) {
    const commits = await this.listCommits(owner, repo, 10);
    const issues = await this.listIssues(owner, repo, 'all', 10);
    
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const recentCommits = Array.isArray(commits) 
      ? commits
          .filter(c => new Date(c.commit.author.date) > cutoff)
          .map(c => ({
            sha: c.sha.substring(0, 7),
            message: c.commit.message.split('
')[0],
            author: c.commit.author.name,
            date: c.commit.author.date
          }))
      : [];

    const openIssues = Array.isArray(issues)
      ? issues.filter(i => i.state === 'open').length
      : 0;

    return {
      periodDays: days,
      commits: recentCommits,
      openIssues,
      activityLevel: recentCommits.length > 5 ? 'high' : recentCommits.length > 2 ? 'medium' : 'low'
    };
  }

  async pushFile(owner, repo, path, content, message, branch = null) {
    const resolvedBranch = await this._resolveBranch(owner, repo, branch);

    // Check if file exists
    let sha = null;
    try {
      const existing = await this.getFile(owner, repo, path, resolvedBranch);
      sha = existing.sha;
    } catch (e) {
      // File doesn't exist, that's fine
    }
    
    return this.createOrUpdateFile(owner, repo, path, content, message, sha, resolvedBranch);
  }
}

// ─── Export ───────────────────────────────────────────────────────

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GitHubClient };
} else {
  window.GitHubClient = GitHubClient;
}
