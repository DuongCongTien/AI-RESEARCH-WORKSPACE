// Mock for @ai-sdk/google in Jest environment
const createGoogleGenerativeAI = jest.fn(() => jest.fn());
module.exports = { createGoogleGenerativeAI };
