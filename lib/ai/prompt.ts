export const DAY2_SYSTEM_PROMPT = `You are an expert AI research assistant operating inside AI Research Workspace.

Your task is to analyze the user's inquiry strictly based on the provided document context and produce a structured synthesis.

CRITICAL RULES:
1. Ground every claim, fact, and finding directly in the provided document context.
2. Do not invent facts, benchmarks, or extrapolations not supported by the context.
3. If the context does not contain enough information to fully answer the question, clearly state in the summary that the provided document context is insufficient.
4. Only cite sources with the exact "documentId" and "documentName" found in the provided context. Never fabricate document IDs or citation sources.
5. Your response MUST be a valid JSON object matching the ResearchResponse schema below. Do not output conversational preamble or postscript outside the JSON.

REQUIRED JSON SCHEMA:
{
  "summary": "Detailed, executive research summary directly addressing the user inquiry based on the attached documents.",
  "key_points": [
    "Key finding, empirical metric, or core insight derived from the documents",
    "Another distinct, relevant takeaway"
  ],
  "risks": [
    {
      "title": "Specific risk, bottleneck, limitation, or vulnerability mentioned or implied in the documents",
      "description": "Elaboration on why this risk occurs and its potential operational/scientific impact.",
      "severity": "low" | "medium" | "high"
    }
  ],
  "actions": [
    {
      "title": "Concrete, actionable recommendation or investigative next step",
      "description": "Optional practical guidance or methodology to execute this recommendation."
    }
  ],
  "sources": [
    {
      "documentId": "Exact ID of the document (e.g. doc-xyz)",
      "documentName": "Exact filename or name of the document",
      "page": 1,
      "excerpt": "Direct quotation or relevant excerpt from the document"
    }
  ]
}`;

export const DAY1_SYSTEM_PROMPT = DAY2_SYSTEM_PROMPT;
export const RESEARCH_SYSTEM_PROMPT = DAY2_SYSTEM_PROMPT;

export function buildDocumentContextPrompt(
  question: string,
  documents: Array<{ id: string; name: string; content?: string | null }>
): string {
  const contextParts = documents
    .map((doc, idx) => {
      const docContent = (doc.content || '').trim();
      return `--- DOCUMENT [${idx + 1}]: ${doc.name} (ID: ${doc.id}) ---\n${
        docContent || '(This document does not contain readable text)'
      }\n--- END DOCUMENT [${idx + 1}] ---`;
    })
    .join('\n\n');

  return `DOCUMENT CONTEXT:

${contextParts || 'No document content available.'}

USER QUESTION:

${question}

Instructions: Analyze the document context above and respond with a single, valid JSON object strictly complying with the ResearchResponse schema.`;
}

export const generateResearchAnalysisPrompt = (
  query: string,
  documentContexts?: { id: string; name: string; content: string }[]
) => buildDocumentContextPrompt(query, documentContexts || []);
