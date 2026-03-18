const { sequelize, User } = require('./api/models/database');

async function debugUsers() {
  try {
    console.log('=== DEBUG USUÁRIOS ===');
    
    // Testar conexão
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Verificar todos os usuários
    const users = await User.findAll({
      order: [['nome', 'ASC']]
    });
    
    console.log(`👥 Total de usuários: ${users.length}`);
    users.forEach(u => {
      console.log(`  - ID: ${u.id}, Nome: ${u.nome}, Email: ${u.email}, Tipo: ${u.tipo_usuario}, Ativo: ${u.ativo}`);
    });
    
    // Verificar usuário mais recente
    const latestUser = await User.findOne({
      order: [['created_at', 'DESC']]
    });
    
    if (latestUser) {
      console.log(`\n📝 Usuário mais recente: ${latestUser.nome} (${latestUser.email})`);
      console.log(`   Criado em: ${latestUser.created_at}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

debugUsers();
