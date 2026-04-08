// lib/api.ts — Factory API client for fetching blog data
// Replaces file-based data fetching with API calls

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const BLOG_SLUG = process.env.BLOG_SLUG || '';

const BASE = `${API_URL}/api/public/blogs/${BLOG_SLUG}`;

async function apiFetch<T>(path: string, revalidate = 3600): Promise<T> {
  const url = `${BASE}${path}`;
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${url}`);
  }
  return res.json();
}

// ── Config ────────────────────────────────────────────────────────────────────

export async function fetchConfig() {
  return apiFetch<Record<string, any>>('/config');
}

// ── Posts ──────────────────────────────────────────────────────────────────────

export interface ApiPost {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  tags: string[];
  content: string | null;
  hero_image_url: string | null;
  pin_image_url: string | null;
  word_count: number;
  reading_time: number;
  date: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  frontmatter: Record<string, any>;
  featured: boolean;
  draft: boolean;
  image: { src: string; alt: string; width: number; height: number };
  pin_image: { src: string; alt: string; width: number; height: number } | null;
}

export interface PaginatedResponse {
  items: ApiPost[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export async function fetchPosts(params?: {
  category?: string;
  tag?: string;
  featured?: boolean;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set('category', params.category);
  if (params?.tag) searchParams.set('tag', params.tag);
  if (params?.featured) searchParams.set('featured', 'true');
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.per_page) searchParams.set('per_page', String(params.per_page));

  const qs = searchParams.toString();
  return apiFetch<PaginatedResponse>(`/posts${qs ? `?${qs}` : ''}`);
}

export async function fetchPostBySlug(slug: string): Promise<ApiPost> {
  return apiFetch<ApiPost>(`/posts/${slug}`);
}

export async function fetchPostSlugs(): Promise<string[]> {
  return apiFetch<string[]>('/posts/slugs');
}

// ── Categories & Tags ─────────────────────────────────────────────────────────

export interface ApiCategory {
  slug: string;
  name: string;
  description: string;
  post_count: number;
}

export interface ApiTag {
  tag: string;
  post_count: number;
}

export async function fetchCategories(): Promise<ApiCategory[]> {
  return apiFetch<ApiCategory[]>('/categories');
}

export async function fetchTags(): Promise<ApiTag[]> {
  return apiFetch<ApiTag[]>('/tags');
}
