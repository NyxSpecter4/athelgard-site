/**
 * Vercel API Client for Athelgard
 * Browser-compatible, no Node deps
 */
class VercelClient {
  constructor(token) {
    this.token = token;
    this.baseUrl = 'https://api.vercel.com';
  }

  async request(path, options = {}) {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Vercel API ${res.status}`);
    }
    return res.json();
  }

  // List all projects
  async listProjects() {
    return this.request('/v9/projects');
  }

  // Get project details
  async getProject(projectId) {
    return this.request(`/v9/projects/${projectId}`);
  }

  // List deployments for a project
  async listDeployments(projectId) {
    return this.request(`/v6/deployments?projectId=${projectId}`);
  }

  // Get deployment details
  async getDeployment(deploymentId) {
    return this.request(`/v13/deployments/${deploymentId}`);
  }

  // Redeploy (create new deployment from same source)
  async redeploy(projectId, deploymentId) {
    return this.request('/v13/deployments', {
      method: 'POST',
      body: JSON.stringify({
        name: projectId,
        deploymentId: deploymentId
      })
    });
  }

  // Get domains for project
  async getProjectDomains(projectId) {
    return this.request(`/v9/projects/${projectId}/domains`);
  }

  // Add domain to project
  async addDomain(projectId, domain) {
    return this.request(`/v10/projects/${projectId}/domains`, {
      method: 'POST',
      body: JSON.stringify({ name: domain })
    });
  }

  // Get environment variables
  async getEnvVars(projectId) {
    return this.request(`/v9/projects/${projectId}/env`);
  }

  // Add environment variable
  async addEnvVar(projectId, key, value, target = ['production']) {
    return this.request(`/v10/projects/${projectId}/env`, {
      method: 'POST',
      body: JSON.stringify({
        key,
        value,
        target
      })
    });
  }

  // Get teams
  async getTeams() {
    return this.request('/v2/teams');
  }

  // Get user info
  async getUser() {
    return this.request('/v2/user');
  }
}

// Expose to window
if (typeof window !== 'undefined') {
  window.VercelClient = VercelClient;
}
