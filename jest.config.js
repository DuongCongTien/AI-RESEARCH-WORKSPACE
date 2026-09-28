/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/lib'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    // Mock ESM-only AI SDK modules that cannot be required in Jest CommonJS
    '^@ai-sdk/(.*)$': '<rootDir>/lib/__mocks__/@ai-sdk/$1',
    '^ai$': '<rootDir>/lib/__mocks__/ai',
    // Mock Prisma client
    '^@/lib/prisma$': '<rootDir>/lib/__mocks__/prisma',
    '^@prisma/client$': '<rootDir>/lib/__mocks__/@prisma/client',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'commonjs',
          moduleResolution: 'node',
          esModuleInterop: true,
          strict: true,
        },
      },
    ],
  },
  // Ignore Next.js server-only modules not needed in tests
  modulePathIgnorePatterns: ['.next'],
  // Increase timeout for slow PDF parsing calls
  testTimeout: 15000,
};

module.exports = config;
