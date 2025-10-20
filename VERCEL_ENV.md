# Variáveis de Ambiente para Vercel

## Configuração no Dashboard da Vercel

Acesse: https://vercel.com/dashboard → Seu Projeto → Settings → Environment Variables

### Adicione estas variáveis:

```
DB_HOST=seu_host_mysql
DB_USER=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
DB_NAME=dev_finance
JWT_SECRET=sua_chave_jwt_super_secreta_aqui
CORS_ORIGIN=https://seu-projeto.vercel.app
PORT=3000
```

### Opções de Banco de Dados:

1. **PlanetScale** (Recomendado - MySQL gratuito)

   - DB_HOST: obtido no dashboard
   - DB_USER: obtido no dashboard
   - DB_PASSWORD: obtido no dashboard
   - DB_NAME: nome do banco

2. **Railway** (MySQL gratuito)

   - DB_HOST: obtido no dashboard
   - DB_USER: obtido no dashboard
   - DB_PASSWORD: obtido no dashboard
   - DB_NAME: nome do banco

3. **MySQL local** (não recomendado para produção)
   - DB_HOST: localhost
   - DB_USER: root
   - DB_PASSWORD: sua_senha
   - DB_NAME: dev_finance

### JWT_SECRET:

Gere uma chave segura: https://generate-secret.vercel.app/32

### CORS_ORIGIN:

Será a URL do seu projeto na Vercel (ex: https://dev-finance.vercel.app)
