import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Lead, LeadStatus } from '@/types';

const DATA_FILE = path.join(process.cwd(), 'data', 'leads.json');

async function readLeads(): Promise<Lead[]> {
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw) as Lead[];
}

async function writeLeads(leads: Lead[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(leads, null, 2), 'utf-8');
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

const VALID_STATUSES: LeadStatus[] = ['new', 'contacted', 'closed'];

// PUT /api/leads/[id] — update lead status only
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json() as { status: LeadStatus };

    if (!body.status || !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: `status must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const leads = await readLeads();
    const index = leads.findIndex(l => l.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    leads[index] = { ...leads[index], status: body.status };
    await writeLeads(leads);

    return NextResponse.json(leads[index], { status: 200 });
  } catch (error) {
    console.error('PUT /api/leads/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}
