// Mock for @prisma/client in Jest environment
const PrismaClient = jest.fn().mockImplementation(() => ({}));
module.exports = { PrismaClient };
