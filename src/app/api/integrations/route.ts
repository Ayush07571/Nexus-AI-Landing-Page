import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { mapIntegration } from '@/lib/mappings';
import { Integration } from '@/types';

// GET /api/integrations
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('integrations')
      .select('*');

    if (error) throw error;

    return NextResponse.json(data.map(mapIntegration), { status: 200 });
  } catch (error: any) {
    console.error('GET /api/integrations error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch integrations' }, { status: 500 });
  }
}

// POST /api/integrations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Partial<Integration>;

    if (!body.name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const id = `int-${Date.now()}`;
    const { data, error } = await supabaseAdmin
      .from('integrations')
      .insert({
        id,
        name: body.name,
        logo: body.logo ?? '🔌',
        category: body.category ?? 'Other',
        description: body.description ?? '',
        color: body.color ?? 'gray',
        visible: body.visible ?? true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(mapIntegration(data), { status: 201 });
  } catch (error: any) {
    console.error('POST /api/integrations error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create integration' }, { status: 500 });
  }
}
