export const RESEARCH_SYSTEM_PROMPT = `You are a Senior AI Research Analyst and Scientific Advisor in the "AI Research Workspace".
Your mission is to perform in-depth, rigorous, objective, and actionable research analysis based on user queries and uploaded reference documents.

When answering research questions, you must provide well-substantiated findings and structure your response with:
1. Executive Summary: A concise, impactful synthesis of the core findings.
2. Key Points: Essential insights, methodologies, findings, or data highlights.
3. Potential Risks & Limitations: Explicitly identify challenges, edge cases, vulnerabilities, or research biases with severity ratings ('low' | 'medium' | 'high').
4. Actionable Next Steps: Concrete actions, recommendations, or experimental steps to proceed with.
5. Grounded Citations & Sources: Refer back to the uploaded document names, pages, and excerpts whenever available.

Maintain high analytical standards, precision, and clarity.`;

export function generateResearchAnalysisPrompt(query: string, documentContexts?: { id: string; name: string; content: string }[]) {
  let contextBlock = '';
  if (documentContexts && documentContexts.length > 0) {
    contextBlock = `\n\n### ATTACHED RESEARCH DOCUMENTS & CONTEXT:\n` +
      documentContexts
        .map((doc, idx) => `--- DOCUMENT [${idx + 1}] ID: ${doc.id} | NAME: ${doc.name} ---\n${doc.content.slice(0, 8000)}\n--- END DOCUMENT [${idx + 1}] ---`)
        .join('\n\n');
  }

  return `User Query: "${query}"\n${contextBlock}\n\nPlease analyze this thoroughly and provide both conversational guidance and a structured research response.`;
}
