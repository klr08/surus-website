#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { glob } from 'glob';
import matter from 'gray-matter';
import path from 'path';

function parseMarkdownFile(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const parsed = matter(content);
  const slugBase = path.basename(filePath).replace(/\.md$/i, '');
  return {
    ...parsed.data,
    slug: parsed.data?.slug || slugBase,
    body: parsed.content?.trim() || ''
  };
}

async function buildBlog() {
  const files = await glob('content/blog/**/*.md');
  const items = files.map(parseMarkdownFile)
    .filter(p => !!p.title && !!p.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return items;
}

async function buildPodcast() {
  const files = await glob('content/podcast/**/*.md');
  const items = files.map(parseMarkdownFile)
    .filter(p => !!(p.title && (p.episode_number || p.episode || p.date)))
    .map(p => ({
      episode_number: p.episode_number || p.episode || null,
      title: p.title,
      date: p.date || null,
      description: p.description || p.excerpt || '',
      guest: p.guest || (Array.isArray(p.guests) ? p.guests.join(', ') : undefined),
      image: p.image || p.coverImage || '',
      spotify_url: p.spotify_url || '',
      apple_url: p.apple_url || '',
      amazon_url: p.amazon_url || '',
      libsyn_url: p.libsyn_url || p.audioUrl || '',
      duration: p.duration || '',
      featured: !!p.featured,
      slug: p.slug
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return items;
}

async function main() {
  const outDir = 'public/data';
  mkdirSync(outDir, { recursive: true });

  const [blog, podcast] = await Promise.all([buildBlog(), buildPodcast()]);
  writeFileSync(path.join(outDir, 'blog.json'), JSON.stringify(blog, null, 2));
  writeFileSync(path.join(outDir, 'podcast.json'), JSON.stringify(podcast, null, 2));
  // Also emit at site root /data for Netlify static serving
  mkdirSync('data', { recursive: true });
  writeFileSync(path.join('data', 'blog.json'), JSON.stringify(blog, null, 2));
  writeFileSync(path.join('data', 'podcast.json'), JSON.stringify(podcast, null, 2));
  console.log(`Generated ${blog.length} blog posts and ${podcast.length} podcast episodes.`);
}

main().catch(err => {
  console.error('Content generation failed', err);
  process.exit(1);
});


