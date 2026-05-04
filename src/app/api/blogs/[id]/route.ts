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
  } catch (error) {
    console.error('GET /api/blogs/[id] error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch blog';
    return NextResponse.json({ error: message }, { status: 500 });
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

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.author !== undefined) updateData.author = body.author;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.coverImage !== undefined) updateData.cover_image = body.coverImage;

    const { data, error } = await supabaseAdmin
      .from('blogs')
      .update(updateData)
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
  } catch (error) {
    console.error('PUT /api/blogs/[id] error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update blog';
    return NextResponse.json({ error: message }, { status: 500 });
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
  } catch (error) {
    console.error('DELETE /api/blogs/[id] error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete blog';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
