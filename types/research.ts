import { z } from 'zod';

export const ResearchRiskSchema = z.object({
  title: z.string().default('Identified Risk'),
  description: z.string().default(''),
  severity: z.enum(['low', 'medium', 'high']).default('low'),
});

export const ResearchActionSchema = z.object({
  title: z.string().default('Recommended Action'),
  description: z.string().optional(),
});

export const ResearchSourceSchema = z.object({
  documentId: z.string().default(''),
  documentName: z.string().default('Document'),
  page: z.number().optional(),
  excerpt: z.string().optional(),
});

export const ResearchResponseSchema = z.object({
  summary: z.string().default(''),
  key_points: z.array(z.string()).default([]),
  risks: z.array(ResearchRiskSchema).default([]),
  actions: z.array(ResearchActionSchema).default([]),
  sources: z.array(ResearchSourceSchema).default([]),
});

export type ResearchRisk = z.infer<typeof ResearchRiskSchema>;
export type ResearchAction = z.infer<typeof ResearchActionSchema>;
export type ResearchSource = z.infer<typeof ResearchSourceSchema>;

export interface ResearchResponse {
  summary: string;
  key_points: string[];
  keyPoints?: string[]; // Backwards-compatible alias
  risks: ResearchRisk[];
  actions: ResearchAction[];
  sources: ResearchSource[];
}

export type DocumentStatus = 'uploading' | 'processing' | 'ready' | 'failed';
export type ChatStatus = 'idle' | 'loading' | 'streaming' | 'success' | 'error';

/**
 * Helper to repair common LLM JSON syntax issues:
 * - Unescaped raw newlines or control chars inside string literals.
 */
function repairJsonText(jsonStr: string): string {
  // Replace unescaped newlines/tabs inside quotes
  let inString = false;
  let isEscaped = false;
  let out = '';

  for (let i = 0; i < jsonStr.length; i++) {
    const ch = jsonStr[i];
    if (ch === '"' && !isEscaped) {
      inString = !inString;
      out += ch;
    } else if (inString && ch === '\n') {
      out += '\\n';
    } else if (inString && ch === '\r') {
      out += '\\r';
    } else if (inString && ch === '\t') {
      out += '\\t';
    } else {
      out += ch;
    }
    isEscaped = ch === '\\' && !isEscaped;
  }
  return out;
}

/**
 * Heuristic extractor if JSON.parse completely fails (e.g., malformed code quotes).
 */
function extractHeuristicFields(text: string): Record<string, unknown> | null {
  const summaryMatch = text.match(/"summary"\s*:\s*"([\s\S]*?)(?="\s*,\s*"(?:key_points|keyPoints|risks|actions|sources)|"\s*\})/);
  if (!summaryMatch) return null;

  const rawSummary = summaryMatch[1]
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    .trim();

  return {
    summary: rawSummary,
    key_points: [],
    risks: [],
    actions: [],
    sources: [],
  };
}

/**
 * Safely parses and normalizes any raw AI response into a valid ResearchResponse object.
 * Handles key_points vs keyPoints, missing fields, unescaped newlines, or raw JSON strings.
 */
export function safeParseResearchResponse(raw: unknown): ResearchResponse | null {
  if (!raw) return null;

  let parsedObj: unknown = raw;
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    // Strategy 1: JSON in markdown code fence ```json ... ```
    const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (fenceMatch) {
      const candidate = fenceMatch[1].trim();
      try {
        parsedObj = JSON.parse(candidate);
      } catch {
        try {
          parsedObj = JSON.parse(repairJsonText(candidate));
        } catch { /* fall through */ }
      }
    }
    // Strategy 2: Entire string is valid JSON
    if (parsedObj === raw) {
      try {
        parsedObj = JSON.parse(trimmed);
      } catch {
        try {
          parsedObj = JSON.parse(repairJsonText(trimmed));
        } catch { /* fall through */ }
      }
    }
    // Strategy 3: Find JSON object anywhere within the text (AI may prepend/append prose)
    if (parsedObj === raw) {
      const jsonStart = trimmed.indexOf('{');
      const jsonEnd = trimmed.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        const candidate = trimmed.slice(jsonStart, jsonEnd + 1);
        try {
          parsedObj = JSON.parse(candidate);
        } catch {
          try {
            parsedObj = JSON.parse(repairJsonText(candidate));
          } catch {
            // Strategy 4: Heuristic regex extraction
            parsedObj = extractHeuristicFields(candidate) || parsedObj;
          }
        }
      }
    }
    // Could not extract any JSON
    if (parsedObj === raw) return null;
  }

  if (typeof parsedObj !== 'object' || parsedObj === null) {
    return null;
  }

  const record = parsedObj as Record<string, unknown>;

  // Normalize key_points / keyPoints
  const keyPointsArr: string[] = Array.isArray(record.key_points)
    ? (record.key_points as string[])
    : Array.isArray(record.keyPoints)
    ? (record.keyPoints as string[])
    : [];

  // Parse risks safely
  const risksArr: ResearchRisk[] = Array.isArray(record.risks)
    ? record.risks.map((item: unknown) => {
        if (typeof item === 'object' && item !== null) {
          const r = item as Record<string, unknown>;
          const severityVal = String(r.severity || 'low').toLowerCase();
          const validSeverity: 'low' | 'medium' | 'high' =
            severityVal === 'high' ? 'high' : severityVal === 'medium' ? 'medium' : 'low';
          return {
            title: String(r.title || 'Risk Factor'),
            description: String(r.description || ''),
            severity: validSeverity,
          };
        }
        return {
          title: String(item),
          description: '',
          severity: 'low',
        };
      })
    : [];

  // Parse actions safely
  const actionsArr: ResearchAction[] = Array.isArray(record.actions)
    ? record.actions.map((item: unknown) => {
        if (typeof item === 'object' && item !== null) {
          const a = item as Record<string, unknown>;
          return {
            title: String(a.title || 'Action Item'),
            description: a.description ? String(a.description) : undefined,
          };
        }
        return {
          title: String(item),
        };
      })
    : [];

  // Parse sources safely
  const sourcesArr: ResearchSource[] = Array.isArray(record.sources)
    ? record.sources.map((item: unknown) => {
        if (typeof item === 'object' && item !== null) {
          const s = item as Record<string, unknown>;
          const pageVal =
            typeof s.page === 'number' && !isNaN(s.page)
              ? s.page
              : typeof s.page === 'string' && !isNaN(parseInt(s.page, 10))
              ? parseInt(s.page, 10)
              : undefined;

          return {
            documentId: String(s.documentId || s.id || ''),
            documentName: String(s.documentName || s.name || 'Document'),
            page: pageVal,
            excerpt: s.excerpt ? String(s.excerpt) : undefined,
          };
        }
        return {
          documentId: '',
          documentName: String(item),
        };
      })
    : [];

  let summaryStr = typeof record.summary === 'string' ? record.summary : '';

  // Clean raw json artifact remnants if summary itself starts with json wrapper
  if (summaryStr.startsWith('{"summary":') || summaryStr.startsWith('{\n  "summary":')) {
    const innerMatch = summaryStr.match(/"summary"\s*:\s*"([\s\S]*?)(?="\s*,\s*"|"\s*\}$)/);
    if (innerMatch) {
      summaryStr = innerMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
    }
  }

  const normalized: ResearchResponse = {
    summary: summaryStr,
    key_points: keyPointsArr,
    keyPoints: keyPointsArr,
    risks: risksArr,
    actions: actionsArr,
    sources: sourcesArr,
  };

  return normalized;
}
