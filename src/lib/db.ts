// Prisma 客户端单例
// 避免开发环境热重载时创建多个连接

import { PrismaClient } from "@prisma/client";

// 声明全局类型，防止 TypeScript 报错
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 开发环境复用已有实例，生产环境每次新建
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
