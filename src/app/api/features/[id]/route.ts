import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { mapFeature } from '@/lib/mappings';
import { Feature } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/features/[id] — update single feature
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json() as Partial<Feature>;

    const { data, error } = await supabaseAdmin
      .from('features')
      .update({
        title: body.title,
        description: body.description,
        icon: body.icon,
        visible: body.visible,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 });
    }

    return NextResponse.json(mapFeature(data), { status: 200 });
  } catch (error: any) {
    console.error('PUT /api/features/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update feature' }, { status: 500 });
  }
}

// DELETE /api/features/[id]
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const { error } = await supabaseAdmin
      .from('features')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('DELETE /api/features/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete feature' }, { status: 500 });
  }
}
