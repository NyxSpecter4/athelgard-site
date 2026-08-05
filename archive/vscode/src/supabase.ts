export class SupabaseClient {
    constructor(private url: string, private key: string) {}

    async request(path: string, options?: RequestInit) {
        const res = await fetch(`${this.url}/rest/v1${path}`, {
            ...options,
            headers: {
                'apikey': this.key,
                'Authorization': `Bearer ${this.key}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation',
                ...options?.headers
            }
        });
        if (!res.ok) throw new Error(`Supabase API ${res.status}`);
        return res.json();
    }

    async listTables() {
        // Introspect via PostgREST
        const res = await fetch(`${this.url}/rest/v1/`, {
            headers: { 'apikey': this.key, 'Authorization': `Bearer ${this.key}` }
        });
        if (!res.ok) throw new Error('Failed to introspect');
        const data = await res.json() as any;
        const paths = data?.definitions || data?.paths || {};
        return Object.keys(paths)
            .filter(p => p.startsWith('/') && !p.includes('rpc/'))
            .map(p => p.replace('/', ''));
    }

    async select(table: string, options?: { limit?: number; filter?: string }) {
        let query = `/${table}?select=*`;
        if (options?.limit) query += `&limit=${options.limit}`;
        if (options?.filter) query += `&${options.filter}`;
        return this.request(query);
    }

    async insert(table: string, data: any) {
        return this.request(`/${table}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
}
