import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { mapBlog } from '@/lib/mappings';
import { Blog } from '@/types';

// GET /api/blogs — list all, optionally filter by ?status=published
export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get('status');
    
    let query = supabaseAdmin.from('blogs').select('*').order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    const mappedData = data.map(mapBlog);
    return NextResponse.json(mappedData, { status: 200 });
  } catch (error: any) {
    console.error('GET /api/blogs error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch blogs' }, { status: 500 });
  }
}

// POST /api/blogs — create a new blog post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Partial<Blog>;

    if (!body.title || !body.slug || !body.content) {
      return NextResponse.json({ error: 'title, slug and content are required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const { data, error } = await supabaseAdmin.from('blogs').insert({
      id,
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt ?? '',
      content: body.content,
      author: body.author ?? 'Admin',
      status: body.status ?? 'draft',
      category: body.category ?? 'General',
      tags: body.tags ?? [],
      cover_image: body.coverImage ?? '',
      created_at: now,
      updated_at: now,
      views: 0,
    }).select().single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A blog with this slug already exists' }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json(mapBlog(data), { status: 201 });
  } catch (error: any) {
    console.error('POST /api/blogs error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create blog' }, { status: 500 });
  }
}
