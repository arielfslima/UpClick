const { Client } = require('pg');

// Teste com a senha original
const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'Delta@20xx',
  database: 'postgres' // conecta ao banco padrão primeiro
});

async function testConnection() {
  try {
    await client.connect();
    console.log('✅ Conexão bem-sucedida ao PostgreSQL!');

    // Tentar criar o banco upclick se não existir
    try {
      await client.query('CREATE DATABASE upclick');
      console.log('✅ Banco de dados "upclick" criado com sucesso!');
    } catch (err) {
      if (err.code === '42P04') {
        console.log('ℹ️  Banco de dados "upclick" já existe');
      } else {
        throw err;
      }
    }

    await client.end();
    console.log('\n✅ Tudo pronto! Execute agora:');
    console.log('   cd backend && npx prisma db push');
  } catch (err) {
    console.error('❌ Erro ao conectar:', err.message);
    console.error('\n💡 Verifique:');
    console.error('   1. PostgreSQL está rodando?');
    console.error('   2. A senha está correta? (Delta@20xx)');
    console.error('   3. O usuário "postgres" existe?');
  }
}

testConnection();
