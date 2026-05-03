import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { Analytics, DailyVisit } from '@/types';

// GET /api/analytics — fetch all stats
export async function GET() {
  try {
    // 1. Total Visits (SUM of all counts in analytics table)
    const { data: visitsSum, error: visitsError } = await supabaseAdmin
      .from('analytics')
      .select('count');
    
    if (visitsError) throw visitsError;
    const totalVisits = visitsSum.reduce((acc, curr) => acc + curr.count, 0);

    // 2. Daily Visits (Last 14 days)
    const { data: dailyVisits, error: dailyError } = await supabaseAdmin
      .from('analytics')
      .select('date, count')
      .order('date', { ascending: false })
      .limit(14);

    if (dailyError) throw dailyError;

    // 3. Total Leads
    const { count: totalLeads, error: leadsError } = await supabaseAdmin
      .from('leads')
      .select('*', { count: 'exact', head: true });

    if (leadsError) throw leadsError;

    const response: Analytics = {
      totalVisits,
      dailyVisits: (dailyVisits as DailyVisit[]).sort((a, b) => a.date.localeCompare(b.date)), // Sort chronologically for charts
      totalLeads: totalLeads || 0,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('GET /api/analytics error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch analytics' }, { status: 500 });
  }
}

// POST /api/analytics — increment today's visit count
export async function POST() {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Try to find today's record
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('analytics')
      .select('count')
      .eq('date', today)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existing) {
      // Update
      const { error: updateError } = await supabaseAdmin
        .from('analytics')
        .update({ count: existing.count + 1 })
        .eq('date', today);
      if (updateError) throw updateError;
    } else {
      // Insert
      const { error: insertError } = await supabaseAdmin
        .from('analytics')
        .insert({ date: today, count: 1 });
      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('POST /api/analytics error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update analytics' }, { status: 500 });
  }
}
