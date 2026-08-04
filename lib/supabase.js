/**
 * Supabase API Client for Athelgard
 * Uses PostgREST API directly for database operations
 */
class SupabaseClient {
  constructor(url, key) {
    this.url = url.replace(/\/$/, '');
    this.key = key;
    this.restUrl = `${this.url}/rest/v1`;
  }

  async request(path, options = {}) {
    const url = `${this.restUrl}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'apikey': this.key,
        'Authorization': `Bearer ${this.key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        ...options.headers
      }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Supabase API ${res.status}`);
    }
    return res.json();
  }

  // Get all tables (uses pg_catalog - may need service_role)
  async listTables() {
    // Try PostgREST introspection
    const res = await fetch(`${this.restUrl}/`, {
      headers: {
        'apikey': this.key,
        'Authorization': `Bearer ${this.key}`
      }
    });
    if (!res.ok) throw new Error('Failed to introspect database');
    const data = await res.json();
    // PostgREST returns { definitions: { paths: { '/table_name': ... } } }
    const paths = data?.definitions || data?.paths || {};
    return Object.keys(paths)
      .filter(p => p.startsWith('/') && !p.includes('rpc/'))
      .map(p => p.replace('/', ''));
  }

  // Get table schema
  async getTableSchema(table) {
    return this.request(`/${table}?limit=0`);
  }

  // Query table
  async select(table, options = {}) {
    let query = `/${table}?select=*`;
    if (options.limit) query += `&limit=${options.limit}`;
    if (options.order) query += `&order=${options.order}`;
    if (options.filter) query += `&${options.filter}`;
    return this.request(query);
  }

  // Insert row
  async insert(table, data) {
    return this.request(`/${table}`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Prefer': 'return=representation' }
    });
  }

  // Update rows
  async update(table, match, data) {
    const matchStr = Object.entries(match).map(([k, v]) => `${k}=eq.${v}`).join('&');
    return this.request(`/${table}?${matchStr}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: { 'Prefer': 'return=representation' }
    });
  }

  // Delete rows
  async delete(table, match) {
    const matchStr = Object.entries(match).map(([k, v]) => `${k}=eq.${v}`).join('&');
    return this.request(`/${table}?${matchStr}`, {
      method: 'DELETE',
      headers: { 'Prefer': 'return=representation' }
    });
  }

  // Execute RPC (stored procedure)
  async rpc(functionName, params = {}) {
    return this.request(`/rpc/${functionName}`, {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  // Get auth users (requires service_role key)
  async listUsers() {
    return this.request('/auth/v1/admin/users', {
      headers: { 'apikey': this.key, 'Authorization': `Bearer ${this.key}` }
    });
  }

  // Storage: list buckets
  async listBuckets() {
    return this.request('/storage/v1/bucket', {
      headers: { 'apikey': this.key, 'Authorization': `Bearer ${this.key}` }
    });
  }

  // Storage: list files in bucket
  async listFiles(bucket) {
    return this.request(`/storage/v1/object/list/${bucket}`, {
      method: 'POST',
      body: JSON.stringify({ limit: 100, offset: 0 })
    });
  }
}

// Expose to window
if (typeof window !== 'undefined') {
  window.SupabaseClient = SupabaseClient;
}
