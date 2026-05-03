import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Testimonial } from '@/types';

const DATA_FILE = path.join(process.cwd(), 'data', 'testimonials.json');

async function readTestimonials(): Promise<Testimonial[]> {
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw) as Testimonial[];
}

async function writeTestimonials(testimonials: Testimonial[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(testimonials, null, 2), 'utf-8');
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/testimonials/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json() as Partial<Testimonial>;
    const testimonials = await readTestimonials();
    const index = testimonials.findIndex(t => t.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }

    testimonials[index] = { ...testimonials[index], ...body, id: testimonials[index].id };
    await writeTestimonials(testimonials);
    return NextResponse.json(testimonials[index], { status: 200 });
  } catch (error) {
    console.error('PUT /api/testimonials/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 });
  }
}

// DELETE /api/testimonials/[id]
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const testimonials = await readTestimonials();
    const index = testimonials.findIndex(t => t.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }

    testimonials.splice(index, 1);
    await writeTestimonials(testimonials);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/testimonials/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 });
  }
}
