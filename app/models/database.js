/**
 * Database Configuration - Sequelize
 * Time Tracking System - Node.js Version
 */
require('dotenv').config();
const { Sequelize } = require('sequelize');

// Database connection
const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgresql://postgres.wqcdytvuwoagaqhdgkfl:node@VersionHhMAIN@aws-1-sa-east-1.pooler.supabase.com:6543/postgres', {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

// Models
const User = sequelize.define('User', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  senha: {
    type: Sequelize.STRING,
    allowNull: false
  },
  tipo_usuario: {
    type: Sequelize.ENUM('Admin', 'Administrador', 'Usuário'),
    defaultValue: 'Usuário'
  },
  gestao: {
    type: Sequelize.STRING
  },
  area: {
    type: Sequelize.STRING
  },
  equipe: {
    type: Sequelize.STRING
  },
  especialidade: {
    type: Sequelize.STRING
  },
  ativo: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  },
  created_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  },
  updated_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const Categoria = sequelize.define('Categoria', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: Sequelize.STRING,
    allowNull: false
  },
  descricao: {
    type: Sequelize.TEXT
  },
  ativo: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  },
  created_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  },
  updated_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  }
}, {
  tableName: 'categorias',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const Atividade = sequelize.define('Atividade', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: Sequelize.STRING,
    allowNull: false
  },
  descricao: {
    type: Sequelize.TEXT
  },
  categoria_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  ativo: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  },
  created_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  },
  updated_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  }
}, {
  tableName: 'atividades',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const Lancamento = sequelize.define('Lancamento', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  atividade_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  data: {
    type: Sequelize.DATEONLY,
    allowNull: false
  },
  hora_inicio: {
    type: Sequelize.TIME,
    allowNull: false
  },
  hora_fim: {
    type: Sequelize.TIME
  },
  horas_trabalhadas: {
    type: Sequelize.DECIMAL(4,2),
    defaultValue: 0
  },
  horas_pendentes: {
    type: Sequelize.DECIMAL(4,2),
    defaultValue: 9
  },
  descricao: {
    type: Sequelize.TEXT
  },
  created_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  },
  updated_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  }
}, {
  tableName: 'lancamentos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Relationships
Categoria.hasMany(Atividade, { foreignKey: 'categoria_id' });
Atividade.belongsTo(Categoria, { foreignKey: 'categoria_id' });

User.hasMany(Lancamento, { foreignKey: 'usuario_id' });
Lancamento.belongsTo(User, { foreignKey: 'usuario_id' });

Atividade.hasMany(Lancamento, { foreignKey: 'atividade_id' });
Lancamento.belongsTo(Atividade, { foreignKey: 'atividade_id' });

module.exports = {
  sequelize,
  User,
  Categoria,
  Atividade,
  Lancamento
};
