import { createOpenAI } from '@ai-sdk/openai';

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export const DEFAULT_MODEL = 'gpt-4o-mini';
export const ADVANCED_MODEL = 'gpt-4o';

export function hasOpenAiKey(): boolean {
  const key = process.env.OPENAI_API_KEY;
  return Boolean(
    key &&
    key.trim() !== '' &&
    key !== 'your-openai-api-key' &&
    !key.includes('your-')
  );
}
