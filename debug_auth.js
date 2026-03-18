const { sequelize, Lancamento, User } = require('./api/models/database');
const bcrypt = require('bcryptjs');

async function debugAuth() {
  try {
    console.log('=== DEBUG AUTENTICAÇÃO ===');
    
    // Testar conexão
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Verificar todos os usuários
    const users = await User.findAll();
    console.log(`👥 Total de usuários: ${users.length}`);
    users.forEach(u => {
      console.log(`  - ID: ${u.id}, Nome: ${u.nome}, Email: ${u.email}, Tipo: ${u.tipo_usuario}`);
    });
    
    // Simular login como user@teste.com
    const testUser = await User.findOne({ where: { email: 'user@teste.com' } });
    if (testUser) {
      console.log(`\n🔐 Simulando login como: ${testUser.nome} (ID: ${testUser.id})`);
      
      // Verificar lançamentos deste usuário
      const lancamentos = await Lancamento.findAll({
        where: { usuario_id: testUser.id },
        include: [
          { model: User, attributes: ['id', 'nome'] }
        ]
      });
      
      console.log(`📊 Lançamentos encontrados: ${lancamentos.length}`);
      lancamentos.forEach((l, i) => {
        console.log(`  ${i+1}. ID: ${l.id}, Data: ${l.data}, Usuário: ${l.User?.nome || 'NULL'}, Atividade ID: ${l.atividade_id}`);
      });
      
      // Verificar lançamentos de hoje
      const today = new Date().toISOString().split('T')[0];
      const todayLancamentos = lancamentos.filter(l => l.data === today);
      console.log(`\n📅 Lançamentos de hoje (${today}): ${todayLancamentos.length}`);
      
      // Testar criação de usuário
      console.log('\n🧪 Testando criação de usuário...');
      const hashedPassword = await bcrypt.hash('test123', 10);
      
      try {
        const newUser = await User.create({
          nome: 'Teste Debug',
          email: 'debug@teste.com',
          senha: hashedPassword,
          tipo_usuario: 'Usuario'
        });
        console.log(`✅ Usuário criado com sucesso! ID: ${newUser.id}`);
        
        // Limpar usuário de teste
        await User.destroy({ where: { id: newUser.id } });
        console.log('🗑️ Usuário de teste removido');
        
      } catch (error) {
        console.error('❌ Erro ao criar usuário:', error.message);
      }
      
    } else {
      console.log('❌ Usuário user@teste.com não encontrado');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

debugAuth();
