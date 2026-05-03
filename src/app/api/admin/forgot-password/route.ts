import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// POST /api/admin/forgot-password
export async function POST(request: NextRequest) {
  try {
    // Accept identifier but never reveal if it was valid
    await request.json().catch(() => ({}));

    const token = crypto.randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour

    const { error } = await supabaseAdmin
      .from('reset_tokens')
      .insert({
        token,
        created_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      });

    if (error) throw error;

    // In a real app, this would be the actual deployment URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/admin/reset-password?token=${token}`;
    console.log(`\n[Nexus Admin] Password reset link:\n${resetUrl}\n`);

    return NextResponse.json(
      { message: 'If valid credentials were entered, a reset link has been logged to the server console.' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('POST /api/admin/forgot-password error:', error);
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}
