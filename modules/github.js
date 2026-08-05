// Browser-side GitHub client. OAuth tokens stay in an HttpOnly server session.
const API = '/api/github';

async function request(action, params = {}) {
  const query = new URLSearchParams({ action, ...params });
  const response = await fetch(`${API}?${query}`, { credentials: 'same-origin' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `GitHub ${response.status}`);
  return data;
}

export function beginGitHubConnect() {
  window.location.assign(`${API}?action=start`);
}

export function getGitHubConnection() {
  return request('status');
}

export function disconnectGitHub() {
  return request('logout');
}

export async function getUserRepos() {
  const { repos } = await request('repos');
  return repos;
}

export function getRepoContents(owner, repo, path = '', ref = '') {
  return request('contents', { owner, repo, path, ...(ref ? { ref } : {}) });
}

function decodeBase64Utf8(value) {
  const bytes = Uint8Array.from(atob(value.replace(/
/g, '')), char => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export async function getFileContent(owner, repo, path, ref = '') {
  const data = await getRepoContents(owner, repo, path, ref);
  return data.content ? decodeBase64Utf8(data.content) : '';
}

export function searchRepos(query) {
  return request('search', { q: query });
}
