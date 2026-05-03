import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { mapFeature } from '@/lib/mappings';
import { Feature } from '@/types';

// GET /api/features
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('features')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data.map(mapFeature), { status: 200 });
  } catch (error: any) {
    console.error('GET /api/features error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch features' }, { status: 500 });
  }
}

// PUT /api/features — replace/upsert the full array
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json() as Feature[];
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Expected an array of features' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('features')
      .upsert(
        body.map((f, index) => ({
          id: f.id,
          title: f.title,
          description: f.description,
          icon: f.icon,
          visible: f.visible,
          sort_order: index,
        })),
        { onConflict: 'id' }
      );

    if (error) throw error;

    return NextResponse.json(body, { status: 200 });
  } catch (error: any) {
    console.error('PUT /api/features error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update features' }, { status: 500 });
  }
}
