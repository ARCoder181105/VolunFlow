import { PrismaClient } from '@prisma/client';

// 1. Create the single, global instance of the Prisma Client
const prisma = new PrismaClient();

// 2. Export that single instance
export default prisma;