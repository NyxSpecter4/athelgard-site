// modules/github.js — GitHub integration
import { CONFIG } from './config.js';

const API_BASE = 'https://api.github.com';
const HEADERS = () => ({
  'Authorization': `token ${CONFIG.githubToken}`,
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'Athelgard/6.0',
});

export async function getUserRepos() {
  const res = await fetch(`${API_BASE}/user/repos?sort=updated&per_page=10`, { headers: HEADERS() });
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  return res.json();
}

export async function getRepoContents(owner, repo, path = '') {
  const res = await fetch(`${API_BASE}/repos/${owner}/${repo}/contents/${path}`, { headers: HEADERS() });
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  return res.json();
}

export async function getFileContent(owner, repo, path) {
  const res = await fetch(`${API_BASE}/repos/${owner}/${repo}/contents/${path}`, { headers: HEADERS() });
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  const data = await res.json();
  return data.content ? atob(data.content) : '';
}

export async function searchRepos(query) {
  const res = await fetch(`${API_BASE}/search/repositories?q=${encodeURIComponent(query)}&per_page=5`, { headers: HEADERS() });
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  return res.json();
}
