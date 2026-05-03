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

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/integrations/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json() as Partial<Integration>;
    const integrations = await readIntegrations();
    const index = integrations.findIndex(i => i.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    integrations[index] = { ...integrations[index], ...body, id: integrations[index].id };
    await writeIntegrations(integrations);
    return NextResponse.json(integrations[index], { status: 200 });
  } catch (error) {
    console.error('PUT /api/integrations/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update integration' }, { status: 500 });
  }
}

// DELETE /api/integrations/[id]
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const integrations = await readIntegrations();
    const index = integrations.findIndex(i => i.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    integrations.splice(index, 1);
    await writeIntegrations(integrations);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/integrations/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete integration' }, { status: 500 });
  }
}
