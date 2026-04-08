// scripts/generate-search-index.ts — Build-time search index generation
// Requirements: 20.1, 21.6
//
// Fetches all published posts from the Factory API and writes a JSON index to
// public/search-index.json containing slug, title, excerpt, category, tags, date.

import fs from 'fs';
import path from 'path';
import type { SearchIndexEntry } from '../lib/search';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const BLOG_SLUG = process.env.BLOG_SLUG || '';
const OUTPUT_PATH = path.join(process.cwd(), 'public', 'search-index.json');

async function buildSearchIndex(): Promise<SearchIndexEntry[]> {
  if (!BLOG_SLUG) {
    console.log('No BLOG_SLUG set — writing empty index.');
    return [];
  }

  const url = `${API_URL}/api/public/blogs/${BLOG_SLUG}/posts?per_page=100`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`API error ${res.status} fetching posts — writing empty index.`);
    return [];
  }

  const data = await res.json();
  const entries: SearchIndexEntry[] = data.items.map((p: any) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.description || '',
    category: p.category || '',
    tags: p.tags || [],
    date: p.date,
  }));

  return entries;
}

// ── Main ──────────────────────────────────────────────────────────────────────

(async () => {
  const entries = await buildSearchIndex();

  const publicDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(entries, null, 2), 'utf-8');
  console.log(`Search index generated: ${entries.length} posts → ${OUTPUT_PATH}`);
})();
