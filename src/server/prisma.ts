import { PrismaClient } from '@prisma/client';

let prisma!: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  if (!prisma) {
    prisma = new PrismaClient({
      log: ['error'],
    });
  }
} else {
  prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });
}

export default prisma;
