import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { mapLead } from '@/lib/mappings';
import { Lead } from '@/types';

// GET /api/leads — list all leads (admin)
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data.map(mapLead), { status: 200 });
  } catch (error: any) {
    console.error('GET /api/leads error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch leads' }, { status: 500 });
  }
}

// POST /api/leads — create new lead from contact form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Partial<Lead>;

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json({ error: 'name, email and message are required' }, { status: 400 });
    }

    const id = `lead-${Date.now()}`;
    const { data, error } = await supabaseAdmin
      .from('leads')
      .insert({
        id,
        name: body.name,
        email: body.email,
        company: body.company ?? '',
        message: body.message,
        status: 'new',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(mapLead(data), { status: 201 });
  } catch (error: any) {
    console.error('POST /api/leads error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create lead' }, { status: 500 });
  }
}
