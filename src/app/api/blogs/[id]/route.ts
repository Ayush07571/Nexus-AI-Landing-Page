import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { mapBlog } from '@/lib/mappings';
import { Blog } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/blogs/[id]
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Check by ID or Slug
    const { data, error } = await supabaseAdmin
      .from('blogs')
      .select('*')
      .or(`id.eq.${id},slug.eq.${id}`)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json(mapBlog(data), { status: 200 });
  } catch (error: any) {
    console.error('GET /api/blogs/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch blog' }, { status: 500 });
  }
}

// PUT /api/blogs/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json() as Partial<Blog>;

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('blogs')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!existing) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    const { data, error } = await supabaseAdmin
      .from('blogs')
      .update({
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt,
        content: body.content,
        author: body.author,
        status: body.status,
        category: body.category,
        tags: body.tags,
        cover_image: body.coverImage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A blog with this slug already exists' }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json(mapBlog(data), { status: 200 });
  } catch (error: any) {
    console.error('PUT /api/blogs/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update blog' }, { status: 500 });
  }
}

// DELETE /api/blogs/[id]
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const { error } = await supabaseAdmin
      .from('blogs')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('DELETE /api/blogs/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete blog' }, { status: 500 });
  }
}
