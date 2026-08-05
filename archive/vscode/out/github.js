"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubClient = void 0;
class GitHubClient {
    token;
    constructor(token) {
        this.token = token;
    }
    async request(path, options) {
        const res = await fetch(`https://api.github.com${path}`, {
            ...options,
            headers: {
                'Authorization': `token ${this.token}`,
                'Accept': 'application/vnd.github.v3+json',
                ...options?.headers
            }
        });
        if (!res.ok)
            throw new Error(`GitHub API ${res.status}`);
        return res.json();
    }
    async listDirectory(repo, path) {
        const [owner, name] = repo.split('/');
        return this.request(`/repos/${owner}/${name}/contents/${path}`);
    }
    async getFile(repo, path) {
        const [owner, name] = repo.split('/');
        const data = await this.request(`/repos/${owner}/${name}/contents/${path}`);
        return atob(data.content);
    }
    async createOrUpdateFile(repo, path, content, message) {
        const [owner, name] = repo.split('/');
        // Get existing file SHA if it exists
        let sha;
        try {
            const existing = await this.request(`/repos/${owner}/${name}/contents/${path}`);
            sha = existing.sha;
        }
        catch (e) {
            // File doesn't exist
        }
        return this.request(`/repos/${owner}/${name}/contents/${path}`, {
            method: 'PUT',
            body: JSON.stringify({
                message,
                content: btoa(content),
                sha
            })
        });
    }
}
exports.GitHubClient = GitHubClient;
//# sourceMappingURL=github.js.map