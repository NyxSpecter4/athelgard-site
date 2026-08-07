// lib/supabase.js — Fixed Supabase Client for Athelgard
// Uses PostgREST API directly with proper error handling

class SupabaseClient {
  constructor(url, key) {
    if (!url || !key) {
      throw new Error('SupabaseClient requires both url and key');
    }
    this.url = url.replace(/\/$/, '');
    this.key = key;
    this.restUrl = `${this.url}/rest/v1`;
    this.headers = {
      'apikey': this.key,
      'Authorization': `Bearer ${this.key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  }

  async request(path, options = {}) {
    const url = `${this.restUrl}${path}`;
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers
        }
      });
      
      if (!res.ok) {
        let err = {};
        try { err = await res.json(); } catch {}
        throw new Error(err.message || `Supabase API ${res.status}: ${res.statusText}`);
      }
      
      // Handle empty responses (DELETE, etc.)
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    } catch (e) {
      if (e.message.includes('fetch failed') || e.message.includes('ECONNREFUSED')) {
        throw new Error('Supabase connection failed. Check URL and network.');
      }
      throw e;
    }
  }

  // Auth: Get current user
  async authUser() {
    return this.request('/auth/v1/user', { method: 'GET' });
  }

  // Auth: Sign in with password
  async authSignIn(email, password) {
    return this.request('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  // Auth: Sign up
  async authSignUp(email, password, metadata = {}) {
    return this.request('/auth/v1/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, data: metadata })
    });
  }

  // Query builders
  from(table) {
    return new SupabaseQueryBuilder(this, table);
  }

  // RPC (stored procedures)
  async rpc(fn, params = {}) {
    return this.request(`/rpc/${fn}`, {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  // Storage
  storage = {
    from: (bucket) => ({
      upload: async (path, file) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${this.url}/storage/v1/object/${bucket}/${path}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${this.key}` },
          body: formData
        });
        if (!res.ok) throw new Error(`Storage upload failed: ${res.status}`);
        return res.json();
      },
      download: async (path) => {
        const res = await fetch(`${this.url}/storage/v1/object/${bucket}/${path}`, {
          headers: { 'Authorization': `Bearer ${this.key}` }
        });
        if (!res.ok) throw new Error(`Storage download failed: ${res.status}`);
        return res.blob();
      }
    })
  };

  // Health check
  async health() {
    try {
      await this.request('/');
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }
}

// Query builder for fluent API
class SupabaseQueryBuilder {
  constructor(client, table) {
    this.client = client;
    this.table = table;
    this.queryParams = new URLSearchParams();
    this.filters = [];
  }

  select(columns = '*') {
    this.queryParams.set('select', columns);
    return this;
  }

  eq(column, value) {
    this.filters.push(`${column}=eq.${value}`);
    return this;
  }

  neq(column, value) {
    this.filters.push(`${column}=neq.${value}`);
    return this;
  }

  gt(column, value) {
    this.filters.push(`${column}=gt.${value}`);
    return this;
  }

  lt(column, value) {
    this.filters.push(`${column}=lt.${value}`);
    return this;
  }

  like(column, pattern) {
    this.filters.push(`${column}=like.${pattern}`);
    return this;
  }

  ilike(column, pattern) {
    this.filters.push(`${column}=ilike.${pattern}`);
    return this;
  }

  in(column, values) {
    this.filters.push(`${column}=in.(${values.join(',')})`);
    return this;
  }

  order(column, { ascending = true } = {}) {
    this.queryParams.set('order', `${column}.${ascending ? 'asc' : 'desc'}`);
    return this;
  }

  limit(n) {
    this.queryParams.set('limit', n);
    return this;
  }

  range(from, to) {
    this.client.headers['Range'] = `${from}-${to}`;
    return this;
  }

  async execute() {
    const filterString = this.filters.join('&');
    const queryString = this.queryParams.toString();
    const path = `/${this.table}?${queryString}${filterString ? '&' + filterString : ''}`;
    return this.client.request(path);
  }

  // Terminal methods
  async single() {
    const result = await this.execute();
    return Array.isArray(result) ? result[0] : result;
  }

  async maybeSingle() {
    try {
      return await this.single();
    } catch {
      return null;
    }
  }

  // Mutations
  async insert(data) {
    return this.client.request(`/${this.table}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async upsert(data) {
    return this.client.request(`/${this.table}`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Prefer': 'return=representation,resolution=merge-duplicates' }
    });
  }

  async update(data) {
    const filterString = this.filters.join('&');
    return this.client.request(`/${this.table}?${filterString}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async delete() {
    const filterString = this.filters.join('&');
    return this.client.request(`/${this.table}?${filterString}`, {
      method: 'DELETE'
    });
  }
}

// Exports
module.exports = { SupabaseClient, SupabaseQueryBuilder };

// Browser global
if (typeof window !== 'undefined') {
  window.SupabaseClient = SupabaseClient;
  window.SupabaseQueryBuilder = SupabaseQueryBuilder;
}
