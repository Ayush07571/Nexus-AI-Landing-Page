import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { ResetToken } from '@/types';

const TOKENS_FILE = path.join(process.cwd(), 'data', 'reset-tokens.json');
const ENV_FILE = path.join(process.cwd(), '.env.local');

async function readTokens(): Promise<ResetToken[]> {
  try {
    const raw = await fs.readFile(TOKENS_FILE, 'utf-8');
    return JSON.parse(raw) as ResetToken[];
  } catch {
    return [];
  }
}

async function writeTokens(tokens: ResetToken[]): Promise<void> {
  await fs.writeFile(TOKENS_FILE, JSON.stringify(tokens, null, 2), 'utf-8');
}

// POST /api/admin/reset-password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { token: string; newPassword: string };

    if (!body.token || !body.newPassword) {
      return NextResponse.json({ error: 'token and newPassword are required' }, { status: 400 });
    }

    const tokens = await readTokens();
    const tokenIndex = tokens.findIndex(t => t.token === body.token);

    if (tokenIndex === -1) {
      return NextResponse.json({ error: 'Reset link is invalid or has expired.' }, { status: 400 });
    }

    const tokenRecord = tokens[tokenIndex];
    if (new Date() > new Date(tokenRecord.expiresAt)) {
      // Remove expired token
      tokens.splice(tokenIndex, 1);
      await writeTokens(tokens);
      return NextResponse.json({ error: 'Reset link is invalid or has expired.' }, { status: 400 });
    }

    // Update ADMIN_PASSWORD in .env.local
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

    // Remove used token
    tokens.splice(tokenIndex, 1);
    await writeTokens(tokens);

    console.log('\n[Nexus Admin] Password updated successfully via reset link.\n');

    return NextResponse.json({ message: 'Password updated successfully.' }, { status: 200 });
  } catch (error) {
    console.error('POST /api/admin/reset-password error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
