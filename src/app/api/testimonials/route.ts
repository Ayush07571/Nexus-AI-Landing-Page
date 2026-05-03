import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { mapTestimonial } from '@/lib/mappings';
import { Testimonial } from '@/types';

// GET /api/testimonials
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('testimonials')
      .select('*');

    if (error) throw error;

    return NextResponse.json(data.map(mapTestimonial), { status: 200 });
  } catch (error: any) {
    console.error('GET /api/testimonials error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch testimonials' }, { status: 500 });
  }
}

// POST /api/testimonials — create new testimonial
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Partial<Testimonial>;

    if (!body.name || !body.quote) {
      return NextResponse.json({ error: 'name and quote are required' }, { status: 400 });
    }

    const id = `testimonial-${Date.now()}`;
    const { data, error } = await supabaseAdmin
      .from('testimonials')
      .insert({
        id,
        name: body.name,
        role: body.role ?? '',
        company: body.company ?? '',
        avatar: body.avatar ?? body.name.charAt(0).toUpperCase(),
        quote: body.quote,
        rating: body.rating ?? 5,
        results: body.results ?? [],
        visible: body.visible ?? true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(mapTestimonial(data), { status: 201 });
  } catch (error: any) {
    console.error('POST /api/testimonials error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create testimonial' }, { status: 500 });
  }
}
