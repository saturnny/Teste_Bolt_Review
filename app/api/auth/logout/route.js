/**
 * Logout API Route
 * Next.js API Route for logout
 */
const { NextResponse } = require('next/server');

// POST /api/auth/logout - Logout
async function POST(request) {
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
async function GET(request) {
  return POST(request);
}

module.exports = { POST, GET };
