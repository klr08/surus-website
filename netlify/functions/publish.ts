// Netlify Function: Publish CMS content to GitHub (triggers Netlify deploy)
// Requires environment variables set in Netlify:
// - GITHUB_TOKEN: a repo-scoped token with contents:write
// - GITHUB_REPO: e.g. "klr08/surus-website"
// - GITHUB_BRANCH: e.g. "main"

import type { Handler } from '@netlify/functions';

type GitHubContentPut = {
  message: string;
  content: string; // base64
  branch: string;
  sha?: string;
};

const GITHUB_API = 'https://api.github.com';

async function getFileSha(path: string, repo: string, branch: string, token: string): Promise<string | undefined> {
  const res = await fetch(`${GITHUB_API}/repos/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`, {
    headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'surus-cms' },
  });
  if (res.status === 404) return undefined;
  if (!res.ok) throw new Error(`Failed to get sha for ${path}: ${res.status}`);
  const json = await res.json();
  return json.sha as string | undefined;
}

async function putFile(path: string, jsonData: unknown, repo: string, branch: string, token: string, message: string): Promise<void> {
  const contentString = JSON.stringify(jsonData, null, 2);
  const base64 = Buffer.from(contentString).toString('base64');
  const sha = await getFileSha(path, repo, branch, token);
  const body: GitHubContentPut = { message, content: base64, branch };
  if (sha) body.sha = sha;

  const res = await fetch(`${GITHUB_API}/repos/${repo}/contents/${encodeURIComponent(path)}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'surus-cms',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to put ${path}: ${res.status} ${text}`);
  }
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!token || !repo) {
    return { statusCode: 500, body: 'Missing server configuration' };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const { blogPosts = [], podcastEpisodes = [], teamMembers = [] } = payload;

    // Ensure data directory files are updated
    await putFile('public/data/blog.json', blogPosts, repo, branch, token, 'chore(cms): publish blog.json from admin');
    await putFile('public/data/podcast.json', podcastEpisodes, repo, branch, token, 'chore(cms): publish podcast.json from admin');
    // Optional: publish team when present
    await putFile('public/data/team.json', teamMembers, repo, branch, token, 'chore(cms): publish team.json from admin');

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, body: (e as Error).message };
  }
};

export default handler;


