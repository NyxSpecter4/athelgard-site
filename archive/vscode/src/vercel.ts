export class VercelClient {
    constructor(private token: string) {}

    async request(path: string, options?: RequestInit) {
        const res = await fetch(`https://api.vercel.com${path}`, {
            ...options,
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json',
                ...options?.headers
            }
        });
        if (!res.ok) throw new Error(`Vercel API ${res.status}`);
        return res.json();
    }

    async listProjects() {
        return this.request('/v9/projects');
    }

    async listDeployments(projectId: string) {
        return this.request(`/v6/deployments?projectId=${projectId}`);
    }

    async deploy(projectId: string, deploymentId: string) {
        return this.request('/v13/deployments', {
            method: 'POST',
            body: JSON.stringify({ name: projectId, deploymentId })
        });
    }
}
