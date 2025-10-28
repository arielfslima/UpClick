const { Client } = require('pg');

async function createDatabase() {
  // Conecta ao banco padrão 'postgres' primeiro
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'Delta@20xx',
    database: 'postgres'
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao PostgreSQL');

    // Verifica se o banco já existe
    const checkDb = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'upclick'"
    );

    if (checkDb.rows.length > 0) {
      console.log('ℹ️  Banco de dados "upclick" já existe');
    } else {
      // Cria o banco
      await client.query('CREATE DATABASE upclick');
      console.log('✅ Banco de dados "upclick" criado com sucesso!');
    }

    await client.end();
    console.log('\n🎉 Pronto! Agora executando prisma db push...\n');
    return true;
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('\n💡 Verifique se:');
    console.error('   1. PostgreSQL está rodando');
    console.error('   2. A senha está correta (Delta@20xx)');
    console.error('   3. O servidor está em localhost:5432');
    await client.end();
    return false;
  }
}

createDatabase().then(success => {
  process.exit(success ? 0 : 1);
});
