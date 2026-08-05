"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VercelClient = void 0;
class VercelClient {
    token;
    constructor(token) {
        this.token = token;
    }
    async request(path, options) {
        const res = await fetch(`https://api.vercel.com${path}`, {
            ...options,
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json',
                ...options?.headers
            }
        });
        if (!res.ok)
            throw new Error(`Vercel API ${res.status}`);
        return res.json();
    }
    async listProjects() {
        return this.request('/v9/projects');
    }
    async listDeployments(projectId) {
        return this.request(`/v6/deployments?projectId=${projectId}`);
    }
    async deploy(projectId, deploymentId) {
        return this.request('/v13/deployments', {
            method: 'POST',
            body: JSON.stringify({ name: projectId, deploymentId })
        });
    }
}
exports.VercelClient = VercelClient;
//# sourceMappingURL=vercel.js.map