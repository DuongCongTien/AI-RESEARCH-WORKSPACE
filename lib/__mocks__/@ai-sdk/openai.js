// Mock for @ai-sdk/openai in Jest environment
const createOpenAI = jest.fn(() => jest.fn());
module.exports = { createOpenAI };
