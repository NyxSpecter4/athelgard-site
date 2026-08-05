"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseClient = void 0;
class SupabaseClient {
    url;
    key;
    constructor(url, key) {
        this.url = url;
        this.key = key;
    }
    async request(path, options) {
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
        if (!res.ok)
            throw new Error(`Supabase API ${res.status}`);
        return res.json();
    }
    async listTables() {
        // Introspect via PostgREST
        const res = await fetch(`${this.url}/rest/v1/`, {
            headers: { 'apikey': this.key, 'Authorization': `Bearer ${this.key}` }
        });
        if (!res.ok)
            throw new Error('Failed to introspect');
        const data = await res.json();
        const paths = data?.definitions || data?.paths || {};
        return Object.keys(paths)
            .filter(p => p.startsWith('/') && !p.includes('rpc/'))
            .map(p => p.replace('/', ''));
    }
    async select(table, options) {
        let query = `/${table}?select=*`;
        if (options?.limit)
            query += `&limit=${options.limit}`;
        if (options?.filter)
            query += `&${options.filter}`;
        return this.request(query);
    }
    async insert(table, data) {
        return this.request(`/${table}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
}
exports.SupabaseClient = SupabaseClient;
//# sourceMappingURL=supabase.js.map