# 🐘 Instalação PostgreSQL Local - Guia Rápido

## 1. Baixar PostgreSQL

**Link de Download:** https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

- Escolha a versão **16.x para Windows x86-64**
- Tamanho: ~350 MB

## 2. Instalar PostgreSQL

1. Execute o instalador baixado
2. **Importante:** Durante a instalação:
   - Defina uma **senha** para o usuário `postgres` (anote!)
   - Porta: deixe **5432** (padrão)
   - Locale: deixe o padrão
   - Marque para instalar:
     - ✅ PostgreSQL Server
     - ✅ pgAdmin 4 (interface gráfica)
     - ✅ Command Line Tools

## 3. Criar o Banco de Dados

### Opção A: Usando pgAdmin (Interface Gráfica)

1. Abra **pgAdmin 4** (instalado junto com PostgreSQL)
2. Conecte ao servidor (use a senha que você definiu)
3. Clique com botão direito em **Databases** → **Create** → **Database**
4. Nome: `upclick`
5. Clique em **Save**

### Opção B: Usando linha de comando

Abra o **PowerShell** ou **CMD** e execute:

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Quando pedir senha, digite a senha que você definiu na instalação

# Criar o banco
CREATE DATABASE upclick;

# Verificar
\l

# Sair
\q
```

## 4. Configurar o .env

Edite o arquivo `backend/.env` e atualize a linha do DATABASE_URL:

```env
DATABASE_URL=postgresql://postgres:SUA_SENHA_AQUI@localhost:5432/upclick
```

**Exemplo:**
Se sua senha for `admin123`, ficaria:
```env
DATABASE_URL=postgresql://postgres:admin123@localhost:5432/upclick
```

## 5. Inicializar o Banco com Prisma

Abra o terminal na pasta do projeto e execute:

```bash
cd backend

# Gerar o Prisma Client
npx prisma generate

# Criar as tabelas no banco
npx prisma db push

# Verificar no Prisma Studio (opcional)
npx prisma studio
```

## 6. Iniciar o Servidor

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## ✅ Pronto!

Acesse: http://localhost:5173

---

## 🆘 Problemas Comuns

### "psql: command not found"
- Adicione o PostgreSQL ao PATH do Windows:
  - Caminho usual: `C:\Program Files\PostgreSQL\16\bin`
  - Painel de Controle → Sistema → Variáveis de Ambiente → Path → Adicionar

### "password authentication failed"
- Verifique se a senha no DATABASE_URL está correta
- Tente resetar a senha do usuário postgres no pgAdmin

### "database upclick does not exist"
- Execute o passo 3 novamente para criar o banco

### Porta 5432 já em uso
- Outro PostgreSQL pode estar rodando
- Verifique no Task Manager ou mude a porta no .env

---

## 📚 Recursos

- pgAdmin: http://localhost:5050 (ou porta que foi configurada)
- Documentação PostgreSQL: https://www.postgresql.org/docs/
- Documentação Prisma: https://www.prisma.io/docs/
