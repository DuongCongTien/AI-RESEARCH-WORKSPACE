import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { LanguageModel } from 'ai';
import fs from 'fs';
import path from 'path';

export const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';
export const ADVANCED_OPENAI_MODEL = 'gpt-4o';

export const DEFAULT_GEMINI_MODEL = 'gemini-3.1-flash-lite';
export const ADVANCED_GEMINI_MODEL = 'gemini-3.8-flash';

export const DEFAULT_MODEL = DEFAULT_OPENAI_MODEL;
export const ADVANCED_MODEL = ADVANCED_OPENAI_MODEL;

/**
 * Reads key from .env or .env.local on disk dynamically if process.env hasn't reloaded.
 */
function getDiskEnvKey(): string {
  try {
    for (const file of ['.env.local', '.env']) {
      const p = path.resolve(/*turbopackIgnore: true*/ process.cwd(), file);
      if (fs.existsSync(p)) {
        const text = fs.readFileSync(p, 'utf-8');
        const match = text.match(/(?:OPENAI_API_KEY|GEMINI_API_KEY|GOOGLE_GENERATIVE_AI_API_KEY)\s*=\s*["']?([^"'\r\n]+)["']?/);
        if (match && match[1] && !match[1].includes('your-')) {
          return match[1].trim();
        }
      }
    }
  } catch {
    // Non-filesystem environments
  }
  return '';
}

/**
 * Returns the effective API key configured in the environment or on disk.
 */
export function getAiApiKey(): string {
  const fromEnv =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.OPENAI_API_KEY ||
    '';
  if (fromEnv && fromEnv.trim() !== '' && !fromEnv.includes('your-')) {
    return fromEnv.trim();
  }
  return getDiskEnvKey();
}

/**
 * Checks whether the key belongs to Google Gemini.
 * Gemini keys typically start with "AQ." or "AIza" or are specified via GEMINI_* env vars.
 */
export function isGeminiKey(key?: string): boolean {
  const k = key ?? getAiApiKey();
  if (!k) return false;
  if (k.startsWith('AQ.') || k.startsWith('AIza')) return true;
  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY) return true;
  return false;
}

/**
 * Checks whether an active, non-placeholder AI key is available.
 */
export function hasAiKey(): boolean {
  const key = getAiApiKey();
  return Boolean(
    key &&
    key.trim() !== '' &&
    key !== 'your-openai-api-key' &&
    key !== 'your-gemini-api-key' &&
    !key.includes('your-')
  );
}

// Backward-compatible alias for existing imports
export const hasOpenAiKey = hasAiKey;

/**
 * Returns the active Vercel AI SDK LanguageModel according to configured provider.
 */
export function getAiModel(modelOverride?: string): LanguageModel {
  const apiKey = getAiApiKey();

  if (isGeminiKey(apiKey)) {
    const google = createGoogleGenerativeAI({ apiKey });
    return google(modelOverride || DEFAULT_GEMINI_MODEL);
  }

  const openaiClient = createOpenAI({ apiKey });
  return openaiClient(modelOverride || DEFAULT_OPENAI_MODEL);
}

// Default export / client for backward compatibility
export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});
