import { PrismaClient } from '@prisma/client';

class DatabaseService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      log: ['error', 'warn'],
    });
  }

  /**
   * Get the Prisma client instance
   */
  getClient(): PrismaClient {
    return this.prisma;
  }

  /**
   * Disconnect from database
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }

  /**
   * Connect to database
   */
  async connect(): Promise<void> {
    await this.prisma.$connect();
  }
}

export default new DatabaseService();
