/**
 * Dashboard Stats API Route
 * Next.js API Route for dashboard statistics
 */
const { NextResponse } = require('next/server');
const jwt = require('jsonwebtoken');
const { User, Lancamento, Atividade, Categoria, sequelize } = require('../../../../app/models/database');

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

// GET /api/dashboard/stats - Get dashboard statistics
async function GET(request) {
  try {
    const user = await verifyToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    const todayLancamentos = await Lancamento.findAll({
      where: { 
        usuario_id: user.id,
        data: today
      },
      include: [
        { model: Atividade, include: [{ model: Categoria }] },
        { model: User, attributes: ['id', 'nome'] }
      ]
    });
    
    // Calcular horas totais do dia
    let totalHorasTrabalhadas = 0;
    todayLancamentos.forEach(lancamento => {
      totalHorasTrabalhadas += parseFloat(lancamento.horas_trabalhadas || 0);
    });
    
    // Calcular horas pendentes baseado em dias lançados
    const allLancamentos = await Lancamento.findAll({
      where: { usuario_id: user.id },
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('data')), 'data']]
    });
    
    const diasLancados = allLancamentos.length;
    const totalHorasMeta = diasLancados * 9;
    
    // Calcular total de horas já trabalhadas em todos os dias
    const todasHorasTrabalhadas = await Lancamento.findAll({
      where: { usuario_id: user.id },
      attributes: [[sequelize.fn('SUM', sequelize.col('horas_trabalhadas')), 'total']]
    });
    
    const totalGeralHorasTrabalhadas = parseFloat(todasHorasTrabalhadas[0]?.dataValues.total || 0);
    const totalHorasPendentes = Math.max(0, totalHorasMeta - totalGeralHorasTrabalhadas);
    
    // Get recent lancamentos
    const recentLancamentos = await Lancamento.findAll({
      where: { usuario_id: user.id },
      include: [
        { model: Atividade, include: [{ model: Categoria }] },
        { model: User, attributes: ['id', 'nome'] }
      ],
      order: [['data', 'DESC'], ['hora_inicio', 'DESC']],
      limit: 10
    });
    
    return NextResponse.json({
      todayCount: todayLancamentos.length,
      totalHorasTrabalhadas: totalHorasTrabalhadas.toFixed(2),
      totalHorasPendentes: totalHorasPendentes.toFixed(2),
      totalGeralHorasTrabalhadas: totalGeralHorasTrabalhadas.toFixed(2),
      diasLancados: diasLancados,
      recentLancamentos: recentLancamentos.map(l => l.toJSON())
    });
    
  } catch (error) {
    console.error('Dashboard stats API error:', error);
    return NextResponse.json({ error: 'Erro ao carregar estatísticas' }, { status: 500 });
  }
}

module.exports = { GET };
