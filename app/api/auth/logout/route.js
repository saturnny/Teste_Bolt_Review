/**
 * Logout API Route
 * Next.js API Route for logout
 */
import { NextResponse } from 'next/server';

// POST /api/auth/logout - Logout
export async function POST(request) {
  try {
    const response = NextResponse.json({ success: true });
    response.cookies.delete('access_token');
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Erro ao fazer logout' }, { status: 500 });
  }
}

// GET /api/auth/logout - Logout (for backward compatibility)
export async function GET(request) {
  return POST(request);
}
