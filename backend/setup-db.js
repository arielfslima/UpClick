const { Client } = require('pg');

async function tryConnection(port, password) {
  const client = new Client({
    host: 'localhost',
    port: port,
    user: 'postgres',
    password: password,
    database: 'postgres'
  });

  try {
    await client.connect();
    console.log(`✅ Conectado ao PostgreSQL na porta ${port}`);

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
    return { success: true, port };
  } catch (error) {
    await client.end().catch(() => {});
    return { success: false, port, error: error.message };
  }
}

async function setup() {
  console.log('🔍 Procurando PostgreSQL...\n');

  const passwords = ['Delta@20xx', 'postgres', 'admin', ''];
  const ports = [5432, 5433];

  for (const port of ports) {
    for (const password of passwords) {
      console.log(`Tentando porta ${port} com senha "${password || '(vazia)'}"`);
      const result = await tryConnection(port, password);

      if (result.success) {
        console.log('\n🎉 Sucesso!');
        console.log(`\n📝 Atualize o .env com:`);
        console.log(`DATABASE_URL=postgresql://postgres:${password}@localhost:${port}/upclick\n`);
        return { port, password };
      }
    }
  }

  console.error('\n❌ Não foi possível conectar com nenhuma combinação.');
  console.error('💡 Tente resetar a senha do PostgreSQL pelo pgAdmin');
  return null;
}

setup().then(config => {
  process.exit(config ? 0 : 1);
});
