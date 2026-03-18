/**
 * Authentication API Routes
 * Next.js API Routes for authentication
 */
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../../app/models/database';

// JWT Secret
const JWT_SECRET = process.env.SECRET_KEY || 'your-secret-key';

// Helper function to verify JWT and get user
async function verifyToken(request) {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});
  
  const token = cookies.access_token;
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    
    if (!user || !user.ativo) return null;
    
    return user.toJSON();
  } catch (error) {
    return null;
  }
}

// POST /api/auth/token - Login
export async function POST(request) {
  try {
    const { username, password } = await request.json();
    
    console.log('🔐 Tentativa de login:', { username, passwordLength: password ? password.length : 0 });
    
    // Find user
    const user = await User.findOne({ where: { email: username } });
    
    console.log('👤 Usuário encontrado:', user ? 'SIM' : 'NÃO');
    
    if (!user) {
      return NextResponse.json({ error: 'Email ou senha incorretos' }, { status: 401 });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.senha);
    
    console.log('🔑 Senha válida:', isValidPassword ? 'SIM' : 'NÃO');
    
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Email ou senha incorretos' }, { status: 401 });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        tipoUsuario: user.tipo_usuario 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('🎫 Token criado com sucesso');
    
    // Set cookie
    const response = NextResponse.json({ success: true, redirect: '/dashboard' });
    response.cookies.set('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    });
    
    console.log('🍪 Cookie definido');
    
    return response;
    
  } catch (error) {
    console.error('❌ Erro no login:', error);
    return NextResponse.json({ error: 'Erro no servidor, tente novamente' }, { status: 500 });
  }
}

// GET /api/auth/check - Check authentication status
export async function GET(request) {
  try {
    const user = await verifyToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Erro na autenticação' }, { status: 500 });
  }
}
