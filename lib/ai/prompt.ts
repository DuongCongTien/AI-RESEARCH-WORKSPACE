export const DAY1_SYSTEM_PROMPT = `You are an AI research assistant.

Answer the user's question using ONLY the provided document context.

If the answer cannot be found in the document, clearly say so.

Do not invent information.`;

export function buildDocumentContextPrompt(
  question: string,
  documents: Array<{ id: string; name: string; content?: string | null }>
): string {
  const contextParts = documents
    .map((doc, idx) => {
      const docContent = (doc.content || '').trim();
      return `--- DOCUMENT [${idx + 1}]: ${doc.name} (ID: ${doc.id}) ---\n${docContent || '(No readable content extracted)'}\n--- END DOCUMENT [${idx + 1}] ---`;
    })
    .join('\n\n');

  return `DOCUMENT CONTEXT:

${contextParts || 'No document content available.'}

USER QUESTION:

${question}

Answer the user's question using ONLY the provided document context. If the answer cannot be found in the document, clearly say so.`;
}

// Backwards compatibility export
export const RESEARCH_SYSTEM_PROMPT = DAY1_SYSTEM_PROMPT;
export const generateResearchAnalysisPrompt = (
  query: string,
  documentContexts?: { id: string; name: string; content: string }[]
) => buildDocumentContextPrompt(query, documentContexts || []);
