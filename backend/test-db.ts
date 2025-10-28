import { PrismaClient } from './src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Conexão com PostgreSQL bem-sucedida!');
    await prisma.$disconnect();
  } catch (error: any) {
    console.error('❌ Erro ao conectar:', error.message);
    console.error('\n💡 Verifique se:');
    console.error('   1. PostgreSQL está rodando');
    console.error('   2. Banco "upclick" foi criado');
    console.error('   3. Senha está correta no .env');
  }
}

main();
