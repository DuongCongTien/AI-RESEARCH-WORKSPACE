import { createOpenAI } from '@ai-sdk/openai';

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export const DEFAULT_MODEL = 'gpt-4o-mini';
export const ADVANCED_MODEL = 'gpt-4o';
