/**
 * Authentication utilities
 * Helper functions for authentication in Next.js
 */
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.SECRET_KEY || 'your-secret-key';

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function getTokenFromCookies(cookies) {
  if (!cookies) return null;
  
  const cookieArray = cookies.split(';');
  for (const cookie of cookieArray) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'access_token') {
      return value;
    }
  }
  return null;
}

export async function getUserFromRequest(request) {
  const cookieHeader = request.headers.get('cookie');
  const token = getTokenFromCookies(cookieHeader);
  
  if (!token) return null;
  
  const decoded = verifyToken(token);
  if (!decoded) return null;
  
  // You might want to fetch full user data from database here
  // For now, return the decoded token data
  return decoded;
}
