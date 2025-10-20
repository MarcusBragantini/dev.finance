# 🚀 Deploy na Vercel - dev.finance

## 📋 Pré-requisitos

1. **Conta na Vercel**: https://vercel.com/signup
2. **Banco de dados MySQL** (PlanetScale, Railway, ou similar)
3. **GitHub** conectado à Vercel

## 🔧 Passo a Passo

### 1. Preparar o Projeto

```bash
# Verificar se todos os arquivos estão prontos
ls -la
# Deve ter: vercel.json, package.json, .vercelignore
```

### 2. Fazer Commit e Push

```bash
git add .
git commit -m "feat: configuração para deploy na Vercel"
git push origin main
```

### 3. Deploy na Vercel

#### Opção A: Via Dashboard Vercel

1. Acesse: https://vercel.com/dashboard
2. Clique em "New Project"
3. Conecte seu repositório GitHub
4. Selecione o projeto `dev.finance`
5. Configure as variáveis de ambiente (ver VERCEL_ENV.md)
6. Clique em "Deploy"

#### Opção B: Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Configurar variáveis de ambiente
vercel env add DB_HOST
vercel env add DB_USER
vercel env add DB_PASSWORD
vercel env add DB_NAME
vercel env add JWT_SECRET
vercel env add CORS_ORIGIN
```

### 4. Configurar Banco de Dados

#### Opção A: PlanetScale (Recomendado)

1. Acesse: https://planetscale.com
2. Crie uma conta gratuita
3. Crie um novo banco: `dev_finance`
4. Copie as credenciais para as variáveis de ambiente

#### Opção B: Railway

1. Acesse: https://railway.app
2. Crie um novo projeto
3. Adicione MySQL
4. Copie as credenciais

### 5. Executar Schema SQL

Após configurar o banco, execute o arquivo `database/schema.sql`:

```sql
-- Copie e execute todo o conteúdo de database/schema.sql
-- no seu banco de dados MySQL
```

### 6. Testar o Deploy

1. **Teste Básico**: Acesse `/test-deploy.html` para verificar se tudo está funcionando
2. **Teste Completo**:
   - Acesse a URL fornecida pela Vercel
   - Teste o registro de usuário
   - Teste o login
   - Teste adicionar transações

## 🔗 URLs Importantes

- **Frontend**: `https://seu-projeto.vercel.app`
- **API**: `https://seu-projeto.vercel.app/api`
- **Login**: `https://seu-projeto.vercel.app/auth/login.html`
- **Dashboard**: `https://seu-projeto.vercel.app/balance/`

## 🐛 Troubleshooting

### Erro de CORS

- Verifique se `CORS_ORIGIN` está correto
- Deve ser a URL exata do seu projeto

### Erro de Banco

- Verifique as credenciais do banco
- Teste a conexão localmente primeiro

### Erro 500

- Verifique os logs na Vercel
- Verifique se todas as variáveis estão configuradas

## 📊 Monitoramento

- **Logs**: Vercel Dashboard → Functions → View Function Logs
- **Métricas**: Vercel Dashboard → Analytics
- **Domínio**: Vercel Dashboard → Domains

## 🎉 Sucesso!

Se tudo funcionar, você terá:

- ✅ Sistema online
- ✅ Banco de dados funcionando
- ✅ Autenticação JWT
- ✅ API RESTful
- ✅ Dark mode
- ✅ 60+ categorias

**Parabéns! Seu sistema está no ar! 🚀💰**
