# Deploy no Vercel - Time Tracking System

## 🚀 Pré-requisitos

1. **Conta no Vercel**: [vercel.com](https://vercel.com)
2. **GitHub**: Repositório com o código
3. **Supabase**: Banco de dados PostgreSQL

## 📋 Variáveis de Ambiente no Vercel

Configure estas variáveis no painel do Vercel (Settings > Environment Variables):

### Banco de Dados
```
DATABASE_URL=postgresql://postgres.wqcdytvuwoagaqhdgkfl:node@VersionHhMAIN@aws-1-sa-east-1.pooler.supabase.com:6543/postgres
```

### Autenticação JWT
```
SECRET_KEY=sua-chave-secreta-muito-segura-aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Ambiente
```
NODE_ENV=production
```

## 🔧 Arquivos de Configuração

### `vercel.json`
```json
{
  "functions": {
    "api/index.js": {
      "memory": 1024,
      "maxDuration": 30
    }
  },
  "routes": [
    {
      "src": "/static/(.*)",
      "dest": "/static/$1"
    },
    {
      "src": "/(.*\\.(js|css|png|jpg|jpeg|gif|ico|svg))",
      "dest": "/static/$1"
    },
    {
      "src": "/(.*)",
      "dest": "api/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### `package.json` - Engines
```json
{
  "engines": {
    "node": "18.x"
  }
}
```

## 🚀 Passos para Deploy

### 1. Conectar Repositório
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Conecte seu repositório GitHub
4. Selecione o repositório `time-tracking-system`

### 2. Configurar Variáveis de Ambiente
1. No painel do projeto Vercel
2. Vá para "Settings" → "Environment Variables"
3. Adicione todas as variáveis listadas acima
4. Marque como "Production" e "Preview"

### 3. Configurar Build
1. Em "Build & Development Settings":
   - **Build Command**: `npm install`
   - **Output Directory**: `.` (raiz)
   - **Install Command**: `npm install`

### 4. Deploy
1. Clique em "Deploy"
2. Aguarde o build
3. Teste a aplicação

## 🧪 Testes Pós-Deploy

### URLs para Testar
- **Home**: `https://seu-projeto.vercel.app/`
- **Login**: `https://seu-projeto.vercel.app/login`
- **Dashboard**: `https://seu-projeto.vercel.app/dashboard`
- **Admin**: `https://seu-projeto.vercel.app/admin/usuarios`

### Teste de API
```bash
curl https://seu-projeto.vercel.app/api/test
```

## 🔍 Debug no Vercel

### Logs
1. Vá para "Functions" → "Logs"
2. Filtre por função `api/index.js`
3. Verifique erros de runtime

### Variáveis de Ambiente
1. Verifique se todas as variáveis foram configuradas
2. Teste conectividade com banco de dados

## 📝 Estrutura de Arquivos Importantes

```
time-tracking-system/
├── api/
│   ├── index.js          # Entry point para Vercel
│   ├── models/
│   └── routes/
├── static/              # CSS, JS, imagens
├── templates/           # Arquivos EJS
├── vercel.json         # Config Vercel
├── package.json        # Dependências
└── .env.example       # Exemplo de variáveis
```

## ⚠️ Considerações Importantes

1. **Banco de Dados**: Supabase deve permitir conexões externas
2. **CORS**: Já configurado no `api/index.js`
3. **Sessões**: Cookies funcionam em produção
4. **Static Files**: Configurado em `vercel.json`
5. **Timeout**: 30 segundos para funções serverless

## 🎉 Sucesso!

Após o deploy, você terá:
- ✅ Aplicação funcional na web
- ✅ Banco de dados conectado
- ✅ Autenticação JWT funcionando
- ✅ Sistema de time tracking completo

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no Vercel
2. Confirme variáveis de ambiente
3. Teste a API endpoints
4. Verifique conectividade com Supabase
