export class GitHubClient {
    constructor(private token: string) {}

    async request(path: string, options?: RequestInit) {
        const res = await fetch(`https://api.github.com${path}`, {
            ...options,
            headers: {
                'Authorization': `token ${this.token}`,
                'Accept': 'application/vnd.github.v3+json',
                ...options?.headers
            }
        });
        if (!res.ok) throw new Error(`GitHub API ${res.status}`);
        return res.json();
    }

    async listDirectory(repo: string, path: string) {
        const [owner, name] = repo.split('/');
        return this.request(`/repos/${owner}/${name}/contents/${path}`);
    }

    async getFile(repo: string, path: string) {
        const [owner, name] = repo.split('/');
        const data = await this.request(`/repos/${owner}/${name}/contents/${path}`) as any;
        return atob(data.content);
    }

    async createOrUpdateFile(repo: string, path: string, content: string, message: string) {
        const [owner, name] = repo.split('/');
        // Get existing file SHA if it exists
        let sha: string | undefined;
        try {
            const existing = await this.request(`/repos/${owner}/${name}/contents/${path}`) as any;
            sha = existing.sha;
        } catch (e) {
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
