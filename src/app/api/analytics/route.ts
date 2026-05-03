import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Analytics } from '@/types';

const DATA_FILE = path.join(process.cwd(), 'data', 'analytics.json');

async function readAnalytics(): Promise<Analytics> {
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw) as Analytics;
}

async function writeAnalytics(data: Analytics): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// GET /api/analytics — fetch all stats
export async function GET() {
  try {
    const data = await readAnalytics();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('GET /api/analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

// POST /api/analytics — increment today's visit count
export async function POST() {
  try {
    const data = await readAnalytics();

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const existingDay = data.dailyVisits.find(d => d.date === today);

    if (existingDay) {
      existingDay.count += 1;
    } else {
      data.dailyVisits.push({ date: today, count: 1 });
    }

    data.totalVisits += 1;
    data.lastUpdated = new Date().toISOString();

    await writeAnalytics(data);
    return NextResponse.json({ success: true, totalVisits: data.totalVisits }, { status: 200 });
  } catch (error) {
    console.error('POST /api/analytics error:', error);
    return NextResponse.json({ error: 'Failed to update analytics' }, { status: 500 });
  }
}
