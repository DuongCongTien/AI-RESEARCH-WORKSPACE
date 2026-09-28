// Mock for 'ai' (Vercel AI SDK) in Jest environment
const streamText = jest.fn(async () => ({
  textStream: (async function* () {})(),
}));
module.exports = { streamText };
