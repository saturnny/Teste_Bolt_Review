const { sequelize, Lancamento, User, Atividade, Categoria } = require('./api/models/database');

async function debugDashboard() {
  try {
    console.log('=== DEBUG DASHBOARD ===');
    
    // Testar conexão
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Buscar todos os lançamentos
    const allLancamentos = await Lancamento.findAll({
      include: [
        { model: Atividade, include: [{ model: Categoria }] },
        { model: User, attributes: ['id', 'nome'] }
      ]
    });
    
    console.log(`📊 Total de lançamentos: ${allLancamentos.length}`);
    
    // Mostrar lançamentos de hoje
    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 Data de hoje: ${today}`);
    
    const todayLancamentos = allLancamentos.filter(l => l.data === today);
    console.log(`🎯 Lançamentos de hoje: ${todayLancamentos.length}`);
    
    if (todayLancamentos.length > 0) {
      console.log('📝 Lançamentos encontrados:');
      todayLancamentos.forEach((l, i) => {
        console.log(`  ${i+1}. ID: ${l.id}, Usuário: ${l.usuario_id}, Data: ${l.data}, Início: ${l.hora_inicio}, Atividade: ${l.Atividade?.nome}`);
      });
    }
    
    // Verificar usuários
    const users = await User.findAll();
    console.log(`👥 Total de usuários: ${users.length}`);
    users.forEach(u => {
      console.log(`  - ${u.id}: ${u.nome} (${u.email})`);
    });
    
    // Testar query específica do dashboard
    console.log('\n=== TESTANDO QUERY DASHBOARD ===');
    const userId = 1; // Supondo que seja o primeiro usuário
    const recentLancamentos = await Lancamento.findAll({
      where: { usuario_id: userId },
      include: [
        { model: Atividade, include: [{ model: Categoria }] },
        { model: User, attributes: ['id', 'nome'] }
      ],
      order: [['data', 'DESC'], ['hora_inicio', 'DESC']],
      limit: 10
    });
    
    console.log(`📈 Lancamentos recentes para usuário ${userId}: ${recentLancamentos.length}`);
    recentLancamentos.forEach((l, i) => {
      console.log(`  ${i+1}. Data: ${l.data}, Atividade: ${l.Atividade?.nome}, Usuário: ${l.User?.nome}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

debugDashboard();
