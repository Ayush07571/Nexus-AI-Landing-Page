import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { mapIntegration } from '@/lib/mappings';
import { Integration } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/integrations/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json() as Partial<Integration>;

    const { data, error } = await supabaseAdmin
      .from('integrations')
      .update({
        name: body.name,
        logo: body.logo,
        category: body.category,
        description: body.description,
        color: body.color,
        visible: body.visible,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    return NextResponse.json(mapIntegration(data), { status: 200 });
  } catch (error: any) {
    console.error('PUT /api/integrations/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update integration' }, { status: 500 });
  }
}

// DELETE /api/integrations/[id]
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const { error } = await supabaseAdmin
      .from('integrations')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('DELETE /api/integrations/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete integration' }, { status: 500 });
  }
}
