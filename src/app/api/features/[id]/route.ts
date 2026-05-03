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

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/features/[id] — update single feature
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json() as Partial<Feature>;
    const features = await readFeatures();
    const index = features.findIndex(f => f.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 });
    }

    features[index] = { ...features[index], ...body, id: features[index].id };
    await writeFeatures(features);
    return NextResponse.json(features[index], { status: 200 });
  } catch (error) {
    console.error('PUT /api/features/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update feature' }, { status: 500 });
  }
}

// DELETE /api/features/[id]
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const features = await readFeatures();
    const index = features.findIndex(f => f.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 });
    }

    features.splice(index, 1);
    await writeFeatures(features);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/features/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete feature' }, { status: 500 });
  }
}
