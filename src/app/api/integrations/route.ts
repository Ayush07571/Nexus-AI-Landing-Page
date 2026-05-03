import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Integration } from '@/types';

const DATA_FILE = path.join(process.cwd(), 'data', 'integrations.json');

async function readIntegrations(): Promise<Integration[]> {
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw) as Integration[];
}

async function writeIntegrations(integrations: Integration[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(integrations, null, 2), 'utf-8');
}

// GET /api/integrations
export async function GET() {
  try {
    const integrations = await readIntegrations();
    return NextResponse.json(integrations, { status: 200 });
  } catch (error) {
    console.error('GET /api/integrations error:', error);
    return NextResponse.json({ error: 'Failed to fetch integrations' }, { status: 500 });
  }
}

// POST /api/integrations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Partial<Integration>;

    if (!body.name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const integrations = await readIntegrations();
    const newIntegration: Integration = {
      id: `int-${Date.now()}`,
      name: body.name,
      logo: body.logo ?? '🔌',
      category: body.category ?? 'Other',
      description: body.description ?? '',
      color: body.color ?? 'gray',
      visible: body.visible ?? true,
    };

    integrations.push(newIntegration);
    await writeIntegrations(integrations);
    return NextResponse.json(newIntegration, { status: 201 });
  } catch (error) {
    console.error('POST /api/integrations error:', error);
    return NextResponse.json({ error: 'Failed to create integration' }, { status: 500 });
  }
}
