import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { PricingData } from '@/types';

const DATA_FILE = path.join(process.cwd(), 'data', 'pricing.json');

async function readPricing(): Promise<PricingData> {
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw) as PricingData;
}

async function writePricing(data: PricingData): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// GET /api/pricing — fetch all plans
export async function GET() {
  try {
    const data = await readPricing();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('GET /api/pricing error:', error);
    return NextResponse.json({ error: 'Failed to fetch pricing' }, { status: 500 });
  }
}

// PUT /api/pricing — update all plans
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json() as PricingData;

    if (!body.plans || !Array.isArray(body.plans)) {
      return NextResponse.json({ error: 'plans array is required' }, { status: 400 });
    }

    await writePricing(body);
    return NextResponse.json(body, { status: 200 });
  } catch (error) {
    console.error('PUT /api/pricing error:', error);
    return NextResponse.json({ error: 'Failed to update pricing' }, { status: 500 });
  }
}
