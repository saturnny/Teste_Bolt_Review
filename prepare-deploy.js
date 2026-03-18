#!/usr/bin/env node

/**
 * Deploy Script - Time Tracking System
 * Prepara o projeto para deploy no Vercel
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Preparando Time Tracking System para deploy no Vercel...\n');

// Verificar arquivos essenciais
const requiredFiles = [
  'api/index.js',
  'package.json',
  'vercel.json',
  '.env.example'
];

console.log('📋 Verificando arquivos essenciais...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - ARQUIVO FALTANTE!`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Alguns arquivos essenciais estão faltando!');
  process.exit(1);
}

// Verificar estrutura de pastas
const requiredDirs = [
  'api/routes',
  'api/models',
  'static',
  'templates'
];

console.log('\n📁 Verificando estrutura de pastas...');
requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}/`);
  } else {
    console.log(`❌ ${dir}/ - PASTA FALTANTE!`);
    allFilesExist = false;
  }
});

// Verificar package.json
console.log('\n📦 Verificando package.json...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

if (!packageJson.engines) {
  console.log('⚠️  Adicionando engines ao package.json...');
  packageJson.engines = { node: '18.x' };
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  console.log('✅ Engines adicionado');
}

if (!packageJson.scripts || !packageJson.scripts.start) {
  console.log('⚠️  Adicionando script start ao package.json...');
  if (!packageJson.scripts) packageJson.scripts = {};
  packageJson.scripts.start = 'node api/index.js';
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  console.log('✅ Script start adicionado');
}

// Criar .env.production se não existir
if (!fs.existsSync('.env.production')) {
  console.log('\n📝 Criando .env.production...');
  const envContent = fs.readFileSync('.env.example', 'utf8');
  fs.writeFileSync('.env.production', envContent);
  console.log('✅ .env.production criado (configure suas variáveis aqui)');
}

// Verificar se api/index.js exporta para Vercel
console.log('\n🔧 Verificando api/index.js...');
const apiContent = fs.readFileSync('api/index.js', 'utf8');
if (!apiContent.includes('module.exports = app')) {
  console.log('❌ api/index.js não exporta para Vercel!');
  process.exit(1);
}
console.log('✅ api/index.js configurado para Vercel');

// Resumo
console.log('\n🎉 Projeto pronto para deploy no Vercel!');
console.log('\n📋 Próximos passos:');
console.log('1. Configure as variáveis de ambiente no Vercel:');
console.log('   - DATABASE_URL');
console.log('   - SECRET_KEY');
console.log('   - NODE_ENV=production');
console.log('\n2. Faça commit e push para o GitHub');
console.log('3. Conecte o repositório no Vercel');
console.log('4. Configure as variáveis de ambiente no painel do Vercel');
console.log('5. Deploy! 🚀');

console.log('\n📖 Consulte vercel-deploy.md para mais detalhes.');
