import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Lead, Analytics } from '@/types';

const LEADS_FILE = path.join(process.cwd(), 'data', 'leads.json');
const ANALYTICS_FILE = path.join(process.cwd(), 'data', 'analytics.json');

async function readLeads(): Promise<Lead[]> {
  const raw = await fs.readFile(LEADS_FILE, 'utf-8');
  return JSON.parse(raw) as Lead[];
}

async function writeLeads(leads: Lead[]): Promise<void> {
  await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
}

async function incrementLeadCount(): Promise<void> {
  try {
    const raw = await fs.readFile(ANALYTICS_FILE, 'utf-8');
    const analytics = JSON.parse(raw) as Analytics;
    analytics.totalLeads = (analytics.totalLeads ?? 0) + 1;
    analytics.lastUpdated = new Date().toISOString();
    await fs.writeFile(ANALYTICS_FILE, JSON.stringify(analytics, null, 2), 'utf-8');
  } catch {
    // Non-fatal: analytics update failure shouldn't block lead creation
  }
}

// GET /api/leads — list all leads (admin)
export async function GET() {
  try {
    const leads = await readLeads();
    leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json(leads, { status: 200 });
  } catch (error) {
    console.error('GET /api/leads error:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

// POST /api/leads — create new lead from contact form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Partial<Lead>;

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json({ error: 'name, email and message are required' }, { status: 400 });
    }

    const leads = await readLeads();
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: body.name,
      email: body.email,
      company: body.company ?? '',
      message: body.message,
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    leads.push(newLead);
    await writeLeads(leads);
    await incrementLeadCount();

    return NextResponse.json(newLead, { status: 201 });
  } catch (error) {
    console.error('POST /api/leads error:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}
