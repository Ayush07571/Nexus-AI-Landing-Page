import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { mapTestimonial } from '@/lib/mappings';
import { Testimonial } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/testimonials/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json() as Partial<Testimonial>;

    const { data, error } = await supabaseAdmin
      .from('testimonials')
      .update({
        name: body.name,
        role: body.role,
        company: body.company,
        avatar: body.avatar,
        quote: body.quote,
        rating: body.rating,
        results: body.results,
        visible: body.visible,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }

    return NextResponse.json(mapTestimonial(data), { status: 200 });
  } catch (error: any) {
    console.error('PUT /api/testimonials/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update testimonial' }, { status: 500 });
  }
}

// DELETE /api/testimonials/[id]
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const { error } = await supabaseAdmin
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('DELETE /api/testimonials/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete testimonial' }, { status: 500 });
  }
}
