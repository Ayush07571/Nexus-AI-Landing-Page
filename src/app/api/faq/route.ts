import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { mapFAQ } from '@/lib/mappings';
import { FAQItem } from '@/types';

export const dynamic = 'force-dynamic';

// GET /api/faq — sorted by order ascending
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('faq')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data.map(mapFAQ), { status: 200 });
  } catch (error) {
    console.error('GET /api/faq error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch FAQ';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/faq — create new item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Partial<FAQItem>;

    if (!body.question || !body.answer) {
      return NextResponse.json({ error: 'question and answer are required' }, { status: 400 });
    }

    // Get max order
    const { data: maxItems, error: maxError } = await supabaseAdmin
      .from('faq')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1);

    if (maxError) throw maxError;
    const maxOrder = maxItems.length > 0 ? maxItems[0].sort_order : 0;

    const id = `faq-${Date.now()}`;
    const { data, error } = await supabaseAdmin
      .from('faq')
      .insert({
        id,
        question: body.question,
        answer: body.answer,
        category: body.category ?? 'General',
        tags: body.tags ?? [],
        sort_order: maxOrder + 1,
        visible: body.visible ?? true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(mapFAQ(data), { status: 201 });
  } catch (error) {
    console.error('POST /api/faq error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create FAQ item';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
