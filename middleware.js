/**
 * Next.js Middleware
 * Protects authenticated routes
 */
const { NextResponse } = require('next/server');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.SECRET_KEY || 'your-secret-key';

// Paths that require authentication
const protectedPaths = ['/dashboard', '/perfil', '/lancamentos', '/admin'];

module.exports = function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Check if the path requires authentication
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  if (isProtectedPath) {
    // Get token from cookies
    const token = request.cookies.get('access_token')?.value;
    
    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    try {
      // Verify token
      jwt.verify(token, JWT_SECRET);
    } catch (error) {
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // Redirect root to dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
};

module.exports.config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
