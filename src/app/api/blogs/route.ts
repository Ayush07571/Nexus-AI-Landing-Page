import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Blog } from '@/types';

const DATA_FILE = path.join(process.cwd(), 'data', 'blogs.json');

async function readBlogs(): Promise<Blog[]> {
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw) as Blog[];
}

async function writeBlogs(blogs: Blog[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(blogs, null, 2), 'utf-8');
}

// GET /api/blogs — list all, optionally filter by ?status=published
export async function GET(request: NextRequest) {
  try {
    const blogs = await readBlogs();
    const status = request.nextUrl.searchParams.get('status');
    const filtered = status ? blogs.filter(b => b.status === status) : blogs;
    // Sort by createdAt descending
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json(filtered, { status: 200 });
  } catch (error) {
    console.error('GET /api/blogs error:', error);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}

// POST /api/blogs — create a new blog post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Partial<Blog>;

    if (!body.title || !body.slug || !body.content) {
      return NextResponse.json({ error: 'title, slug and content are required' }, { status: 400 });
    }

    const blogs = await readBlogs();

    // Check slug uniqueness
    if (blogs.some(b => b.slug === body.slug)) {
      return NextResponse.json({ error: 'A blog with this slug already exists' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const newBlog: Blog = {
      id: Date.now().toString(),
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt ?? '',
      content: body.content,
      author: body.author ?? 'Admin',
      status: body.status ?? 'draft',
      category: body.category ?? 'General',
      tags: body.tags ?? [],
      coverImage: body.coverImage ?? '',
      createdAt: now,
      updatedAt: now,
      views: 0,
    };

    blogs.push(newBlog);
    await writeBlogs(blogs);

    return NextResponse.json(newBlog, { status: 201 });
  } catch (error) {
    console.error('POST /api/blogs error:', error);
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
  }
}
