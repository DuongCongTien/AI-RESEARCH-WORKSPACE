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
 * Safely parses and normalizes any raw AI response into a valid ResearchResponse object.
 * Handles key_points vs keyPoints, missing fields, or raw JSON strings.
 */
export function safeParseResearchResponse(raw: unknown): ResearchResponse | null {
  if (!raw) return null;

  let parsedObj: unknown = raw;
  if (typeof raw === 'string') {
    try {
      // Find JSON block if wrapped in markdown code fence
      const trimmed = raw.trim();
      const jsonMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const cleanJson = jsonMatch ? jsonMatch[1] : trimmed;
      parsedObj = JSON.parse(cleanJson);
    } catch {
      return null;
    }
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

  const summaryStr = typeof record.summary === 'string' ? record.summary : '';

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
