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

// GET /api/faq — sorted by order ascending
export async function GET() {
  try {
    const items = await readFAQ();
    items.sort((a, b) => a.order - b.order);
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error('GET /api/faq error:', error);
    return NextResponse.json({ error: 'Failed to fetch FAQ' }, { status: 500 });
  }
}

// POST /api/faq — create new item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Partial<FAQItem>;

    if (!body.question || !body.answer) {
      return NextResponse.json({ error: 'question and answer are required' }, { status: 400 });
    }

    const items = await readFAQ();
    const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.order)) : 0;

    const newItem: FAQItem = {
      id: `faq-${Date.now()}`,
      question: body.question,
      answer: body.answer,
      category: body.category ?? 'General',
      tags: body.tags ?? [],
      order: maxOrder + 1,
      visible: body.visible ?? true,
    };

    items.push(newItem);
    await writeFAQ(items);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('POST /api/faq error:', error);
    return NextResponse.json({ error: 'Failed to create FAQ item' }, { status: 500 });
  }
}
