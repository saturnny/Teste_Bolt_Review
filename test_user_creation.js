const { sequelize, User } = require('./api/models/database');
const bcrypt = require('bcryptjs');

async function testUserCreation() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    try {
      const newUser = await User.create({
        nome: 'Teste Debug',
        email: 'debug@teste.com',
        senha: hashedPassword,
        tipo_usuario: 'Usuário'
      });
      console.log(`✅ Usuário criado! ID: ${newUser.id}`);
      await User.destroy({ where: { id: newUser.id } });
      console.log('🗑️ Usuário removido');
    } catch (error) {
      console.error('❌ Erro:', error.message);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

testUserCreation();
