import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { ResetToken } from '@/types';
import crypto from 'crypto';

const TOKENS_FILE = path.join(process.cwd(), 'data', 'reset-tokens.json');

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

// POST /api/admin/forgot-password
export async function POST(request: NextRequest) {
  try {
    // Accept identifier but never reveal if it was valid
    await request.json().catch(() => ({}));

    const token = crypto.randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour

    const newToken: ResetToken = {
      token,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    const tokens = await readTokens();
    tokens.push(newToken);
    await writeTokens(tokens);

    const resetUrl = `http://localhost:3000/admin/reset-password?token=${token}`;
    console.log(`\n[Nexus Admin] Password reset link:\n${resetUrl}\n`);

    return NextResponse.json(
      { message: 'If valid credentials were entered, a reset link has been logged to the server console.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/admin/forgot-password error:', error);
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}
