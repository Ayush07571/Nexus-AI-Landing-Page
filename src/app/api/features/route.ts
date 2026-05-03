import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Feature } from '@/types';

const DATA_FILE = path.join(process.cwd(), 'data', 'features.json');

async function readFeatures(): Promise<Feature[]> {
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw) as Feature[];
}

async function writeFeatures(features: Feature[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(features, null, 2), 'utf-8');
}

// GET /api/features
export async function GET() {
  try {
    const features = await readFeatures();
    return NextResponse.json(features, { status: 200 });
  } catch (error) {
    console.error('GET /api/features error:', error);
    return NextResponse.json({ error: 'Failed to fetch features' }, { status: 500 });
  }
}

// PUT /api/features — replace the full array
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json() as Feature[];
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Expected an array of features' }, { status: 400 });
    }
    await writeFeatures(body);
    return NextResponse.json(body, { status: 200 });
  } catch (error) {
    console.error('PUT /api/features error:', error);
    return NextResponse.json({ error: 'Failed to update features' }, { status: 500 });
  }
}
