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

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/blogs/[id]
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const blogs = await readBlogs();
    const blog = blogs.find(b => b.id === id || b.slug === id);
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }
    return NextResponse.json(blog, { status: 200 });
  } catch (error) {
    console.error('GET /api/blogs/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch blog' }, { status: 500 });
  }
}

// PUT /api/blogs/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json() as Partial<Blog>;
    const blogs = await readBlogs();
    const index = blogs.findIndex(b => b.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // If slug changed, check uniqueness
    if (body.slug && body.slug !== blogs[index].slug) {
      if (blogs.some((b, i) => b.slug === body.slug && i !== index)) {
        return NextResponse.json({ error: 'A blog with this slug already exists' }, { status: 400 });
      }
    }

    const updated: Blog = {
      ...blogs[index],
      ...body,
      id: blogs[index].id, // prevent id change
      updatedAt: new Date().toISOString(),
    };

    blogs[index] = updated;
    await writeBlogs(blogs);

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('PUT /api/blogs/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 });
  }
}

// DELETE /api/blogs/[id]
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const blogs = await readBlogs();
    const index = blogs.findIndex(b => b.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    blogs.splice(index, 1);
    await writeBlogs(blogs);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/blogs/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
  }
}
