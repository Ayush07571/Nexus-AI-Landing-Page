import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { mapFAQ } from '@/lib/mappings';
import { FAQItem } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/faq/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json() as Partial<FAQItem>;

    const { data, error } = await supabaseAdmin
      .from('faq')
      .update({
        question: body.question,
        answer: body.answer,
        category: body.category,
        tags: body.tags,
        sort_order: body.order,
        visible: body.visible,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: 'FAQ item not found' }, { status: 404 });
    }

    return NextResponse.json(mapFAQ(data), { status: 200 });
  } catch (error: any) {
    console.error('PUT /api/faq/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update FAQ item' }, { status: 500 });
  }
}

// DELETE /api/faq/[id]
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const { error } = await supabaseAdmin
      .from('faq')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('DELETE /api/faq/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete FAQ item' }, { status: 500 });
  }
}
