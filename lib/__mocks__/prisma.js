// Mock for @/lib/prisma in Jest environment
const prisma = {
  document: {
    findMany: jest.fn(async () => []),
    findUnique: jest.fn(async () => null),
    create: jest.fn(async (data) => data),
    update: jest.fn(async (data) => data),
    delete: jest.fn(async () => {}),
  },
  conversation: {
    findUnique: jest.fn(async () => null),
    findMany: jest.fn(async () => []),
    create: jest.fn(async (data) => data),
    update: jest.fn(async (data) => data),
    delete: jest.fn(async () => {}),
  },
  message: {
    create: jest.fn(async (data) => data),
    findMany: jest.fn(async () => []),
  },
};
module.exports = { prisma, default: prisma };
