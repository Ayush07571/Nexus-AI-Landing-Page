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

// GET /api/testimonials
export async function GET() {
  try {
    const testimonials = await readTestimonials();
    return NextResponse.json(testimonials, { status: 200 });
  } catch (error) {
    console.error('GET /api/testimonials error:', error);
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}

// POST /api/testimonials — create new testimonial
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Partial<Testimonial>;

    if (!body.name || !body.quote) {
      return NextResponse.json({ error: 'name and quote are required' }, { status: 400 });
    }

    const testimonials = await readTestimonials();
    const newTestimonial: Testimonial = {
      id: `testimonial-${Date.now()}`,
      name: body.name,
      role: body.role ?? '',
      company: body.company ?? '',
      avatar: body.avatar ?? body.name.charAt(0).toUpperCase(),
      quote: body.quote,
      rating: body.rating ?? 5,
      results: body.results ?? [],
      visible: body.visible ?? true,
    };

    testimonials.push(newTestimonial);
    await writeTestimonials(testimonials);
    return NextResponse.json(newTestimonial, { status: 201 });
  } catch (error) {
    console.error('POST /api/testimonials error:', error);
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 });
  }
}
