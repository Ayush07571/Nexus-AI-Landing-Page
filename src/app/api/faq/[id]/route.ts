import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { FAQItem } from '@/types';

const DATA_FILE = path.join(process.cwd(), 'data', 'faq.json');

async function readFAQ(): Promise<FAQItem[]> {
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw) as FAQItem[];
}

async function writeFAQ(items: FAQItem[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2), 'utf-8');
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/faq/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json() as Partial<FAQItem>;
    const items = await readFAQ();
    const index = items.findIndex(f => f.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'FAQ item not found' }, { status: 404 });
    }

    items[index] = { ...items[index], ...body, id: items[index].id };
    await writeFAQ(items);
    return NextResponse.json(items[index], { status: 200 });
  } catch (error) {
    console.error('PUT /api/faq/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update FAQ item' }, { status: 500 });
  }
}

// DELETE /api/faq/[id]
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const items = await readFAQ();
    const index = items.findIndex(f => f.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'FAQ item not found' }, { status: 404 });
    }

    items.splice(index, 1);
    await writeFAQ(items);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/faq/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete FAQ item' }, { status: 500 });
  }
}
