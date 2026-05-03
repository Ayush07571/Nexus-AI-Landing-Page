import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { mapPricing } from '@/lib/mappings';
import { PricingData } from '@/types';

// GET /api/pricing — fetch all plans
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('pricing')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      plans: data.map(mapPricing)
    }, { status: 200 });
  } catch (error: any) {
    console.error('GET /api/pricing error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch pricing' }, { status: 500 });
  }
}

// PUT /api/pricing — update all plans
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json() as PricingData;

    if (!body.plans || !Array.isArray(body.plans)) {
      return NextResponse.json({ error: 'plans array is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('pricing')
      .upsert(
        body.plans.map((plan, index) => ({
          id: plan.id,
          name: plan.name,
          description: plan.description,
          monthly_price: plan.monthlyPrice,
          annual_price: plan.annualPrice,
          badge: plan.badge,
          highlighted: plan.highlighted,
          cta: plan.cta,
          features: plan.features,
          sort_order: index
        })),
        { onConflict: 'id' }
      );

    if (error) throw error;

    return NextResponse.json(body, { status: 200 });
  } catch (error: any) {
    console.error('PUT /api/pricing error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update pricing' }, { status: 500 });
  }
}
