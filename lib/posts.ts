// lib/posts.ts — API-driven post fetching (replaces file-based MDX reading)
// Requirements: 11.1, 21.6

import type { Post, PostFrontmatter } from '@/types/post';
import {
  fetchPosts,
  fetchPostBySlug,
  fetchPostSlugs,
  type ApiPost,
  type PaginatedResponse,
} from '@/lib/api';

// ── Conversion ────────────────────────────────────────────────────────────────

/** Convert an API post response to the internal Post type */
function apiPostToPost(p: ApiPost): Post {
  const frontmatter: PostFrontmatter = {
    title: p.title,
    slug: p.slug,
    description: p.description || '',
    date: p.date,
    category: p.category || '',
    image: p.image,
    tags: p.tags,
    featured: p.featured,
    draft: false,
    pinImage: p.pin_image ?? undefined,
    pinDescription: p.frontmatter?.pinDescription,
    updatedDate: p.updated_at ? p.updated_at.split('T')[0] : undefined,
    author: p.frontmatter?.author,
    noindex: p.frontmatter?.noindex,
    canonicalUrl: p.frontmatter?.canonicalUrl,
    relatedSlugs: p.frontmatter?.relatedSlugs,
    faq: p.frontmatter?.faq,
  };

  return {
    frontmatter,
    content: p.content || '',
    readingTime: p.reading_time,
    wordCount: p.word_count,
    excerpt: p.description || (p.content || '').slice(0, 160),
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Returns all published posts, sorted newest first */
export async function getAllPosts(): Promise<Post[]> {
  const res = await fetchPosts({ per_page: 100 });
  return res.items.map(apiPostToPost);
}

/** Returns a single published post by slug, or undefined */
export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  try {
    const p = await fetchPostBySlug(slug);
    return apiPostToPost(p);
  } catch {
    return undefined;
  }
}

/** Returns all posts for a given category slug */
export async function getPostsByCategory(categorySlug: string): Promise<Post[]> {
  const res = await fetchPosts({ category: categorySlug, per_page: 100 });
  return res.items.map(apiPostToPost);
}

/** Returns all posts for a given tag */
export async function getPostsByTag(tag: string): Promise<Post[]> {
  const res = await fetchPosts({ tag, per_page: 100 });
  return res.items.map(apiPostToPost);
}

/** Returns all unique slugs for published posts (used by generateStaticParams) */
export async function getAllPostSlugs(): Promise<string[]> {
  return fetchPostSlugs();
}

/** Returns all unique category slugs present in published posts */
export async function getAllCategorySlugs(): Promise<string[]> {
  const { fetchCategories } = await import('@/lib/api');
  const cats = await fetchCategories();
  return cats.map((c) => c.slug);
}

/** Returns all unique tags present in published posts */
export async function getAllTags(): Promise<string[]> {
  const { fetchTags } = await import('@/lib/api');
  const tags = await fetchTags();
  return tags.map((t) => t.tag);
}

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PaginatedPosts {
  posts: Post[];
  totalPosts: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/** Returns a paginated slice of posts */
export function getPaginatedPosts(
  posts: Post[],
  page: number,
  perPage: number,
): PaginatedPosts {
  const totalPosts = posts.length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / perPage));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * perPage;
  const end = start + perPage;

  return {
    posts: posts.slice(start, end),
    totalPosts,
    totalPages,
    currentPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}

/** Returns featured posts, up to limit */
export async function getFeaturedPosts(limit = 3): Promise<Post[]> {
  const res = await fetchPosts({ featured: true, per_page: limit });
  return res.items.map(apiPostToPost);
}

/** Returns related posts by matching category or tags, excluding the current slug */
export async function getRelatedPosts(post: Post, limit = 3): Promise<Post[]> {
  const { slug, category, tags = [], relatedSlugs = [] } = post.frontmatter;
  const allPosts = await getAllPosts();

  return allPosts
    .filter((p) => p.frontmatter.slug !== slug)
    .map((p) => {
      let score = 0;
      if (relatedSlugs.includes(p.frontmatter.slug)) score += 10;
      if (p.frontmatter.category === category) score += 3;
      const sharedTags = (p.frontmatter.tags ?? []).filter((t) => tags.includes(t));
      score += sharedTags.length;
      return { post: p, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ post: p }) => p);
}
