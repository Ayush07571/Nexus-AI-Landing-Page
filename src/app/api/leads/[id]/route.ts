import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { mapLead } from '@/lib/mappings';
import { LeadStatus } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const VALID_STATUSES: LeadStatus[] = ['new', 'contacted', 'closed'];

// PUT /api/leads/[id] — update lead status only
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json() as { status: LeadStatus };

    if (!body.status || !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: `status must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('leads')
      .update({ status: body.status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json(mapLead(data), { status: 200 });
  } catch (error: any) {
    console.error('PUT /api/leads/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update lead' }, { status: 500 });
  }
}
