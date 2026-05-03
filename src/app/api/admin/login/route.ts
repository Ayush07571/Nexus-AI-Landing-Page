import { NextRequest, NextResponse } from 'next/server';

// POST /api/admin/login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { password: string };

    if (!body.password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD env variable is not set');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    if (body.password !== adminPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true }, { status: 200 });
    response.cookies.set('admin_auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('POST /api/admin/login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

// POST /api/admin/logout
export async function DELETE() {
  const response = NextResponse.json({ success: true }, { status: 200 });
  response.cookies.set('admin_auth', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
