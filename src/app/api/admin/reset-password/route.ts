import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import fs from 'fs/promises';
import path from 'path';

const ENV_FILE = path.join(process.cwd(), '.env.local');

// POST /api/admin/reset-password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { token: string; newPassword: string };

    if (!body.token || !body.newPassword) {
      return NextResponse.json({ error: 'token and newPassword are required' }, { status: 400 });
    }

    // 1. Verify token in Supabase
    const { data: tokenRecord, error: fetchError } = await supabaseAdmin
      .from('reset_tokens')
      .select('*')
      .eq('token', body.token)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!tokenRecord) {
      return NextResponse.json({ error: 'Reset link is invalid or has expired.' }, { status: 400 });
    }

    // 2. Check expiration
    if (new Date() > new Date(tokenRecord.expires_at)) {
      // Cleanup expired token
      await supabaseAdmin.from('reset_tokens').delete().eq('token', body.token);
      return NextResponse.json({ error: 'Reset link is invalid or has expired.' }, { status: 400 });
    }

    // 3. Update ADMIN_PASSWORD in .env.local (This part remains local as it's configuration)
    let envContent = '';
    try {
      envContent = await fs.readFile(ENV_FILE, 'utf-8');
    } catch {
      envContent = '';
    }

    if (envContent.includes('ADMIN_PASSWORD=')) {
      envContent = envContent.replace(
        /^ADMIN_PASSWORD=.*/m,
        `ADMIN_PASSWORD=${body.newPassword}`
      );
    } else {
      envContent += `\nADMIN_PASSWORD=${body.newPassword}`;
    }

    await fs.writeFile(ENV_FILE, envContent, 'utf-8');

    // 4. Remove used token
    await supabaseAdmin.from('reset_tokens').delete().eq('token', body.token);

    console.log('\n[Nexus Admin] Password updated successfully via reset link.\n');

    return NextResponse.json({ message: 'Password updated successfully.' }, { status: 200 });
  } catch (error: any) {
    console.error('POST /api/admin/reset-password error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
