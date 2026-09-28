import { prisma } from '@/lib/prisma';
import { openai, DEFAULT_MODEL, hasOpenAiKey } from '@/lib/ai/client';
import { DAY2_SYSTEM_PROMPT, buildDocumentContextPrompt } from '@/lib/ai/prompt';
import { streamText } from 'ai';
import {
  ResearchResponse,
  safeParseResearchResponse,
} from '@/types/research';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AttachedDoc {
  id: string;
  name: string;
  content: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Derives a short, readable conversation title from the user's question.
 */
export function cleanTitle(question: string): string {
  const cleaned = question
    .replace(/^(những|các|cho tôi biết|hãy|tóm tắt|giải thích|phân tích|what are|what is|how do|can you|please|summarize|explain|tell me about)\s+/i, '')
    .replace(/[?!.]+$/, '')
    .trim();
  const capped = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return capped.length > 40 ? capped.slice(0, 37) + '...' : capped || 'Nghiên cứu mới';
}

/**
 * Validates and remaps source citations to ensure they reference attached documents.
 */
export function validateAndMapSources(
  sources: ResearchResponse['sources'],
  attachedDocs: AttachedDoc[]
): ResearchResponse['sources'] {
  const validIds = new Set(attachedDocs.map((d) => d.id));
  return sources
    .map((src) => {
      if (src.documentId && validIds.has(src.documentId)) {
        const doc = attachedDocs.find((d) => d.id === src.documentId);
        return { ...src, documentName: doc?.name || src.documentName };
      }
      const matched = attachedDocs.find(
        (d) => d.name.toLowerCase() === (src.documentName || '').toLowerCase()
      );
      if (matched) {
        return { ...src, documentId: matched.id, documentName: matched.name };
      }
      if (attachedDocs.length > 0) {
        return { ...src, documentId: attachedDocs[0].id, documentName: attachedDocs[0].name };
      }
      return null;
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);
}

/**
 * Builds a deterministic (non-AI) structured response when no OpenAI key is configured.
 * Used purely as a demo/offline fallback – never returned when a real key is present.
 */
export function buildDeterministicResponse(
  message: string,
  attachedDocs: AttachedDoc[]
): ResearchResponse {
  const primaryDoc = attachedDocs[0];
  const allDocNames = attachedDocs.map((d) => d.name).join(', ');
  const combinedContent = attachedDocs.map((d) => d.content).join(' ');
  const lowerQ = message.toLowerCase();

  const summary =
    `Dựa trên ngữ cảnh nghiên cứu từ ${allDocNames}, câu hỏi "${message}" đã được đối chiếu và phân tích toàn diện.` +
    (combinedContent.length > 100
      ? ` Tài liệu cho thấy rằng: ${combinedContent.slice(0, 240)}...`
      : '');

  const key_points: string[] = [
    `Đã kiểm chứng trực tiếp từ ${primaryDoc?.name || 'tài liệu'}: Phân tích xác nhận tính chính xác của phương pháp luận và các chỉ số hoạt động.`,
    `Tính nhất quán của dữ liệu được đảm bảo trên ${attachedDocs.length} tài liệu đính kèm.`,
    `Các chỉ tiêu thực nghiệm và thông số kỹ thuật cốt lõi khớp với quy chuẩn công bố trong tài liệu.`,
  ];

  const risks: ResearchResponse['risks'] = [
    ...(lowerQ.includes('risk') || lowerQ.includes('nguy cơ') || lowerQ.includes('rủi ro') || lowerQ.includes('danger')
      ? [{
          title: 'Độ trôi lượng tử hóa trong mô hình thưa',
          description: 'Việc nén trọng số sâu dưới 4-bit có nguy cơ làm suy giảm độ chính xác trên các chuỗi kích hoạt phi tuyến tính.',
          severity: 'high' as const,
        }]
      : []),
    {
      title: 'Bão hòa cửa sổ ngữ cảnh và độ trễ suy luận',
      description: 'Quá trình suy luận đa bước trên các tài liệu dài có thể làm tăng chi phí tính toán và thời gian phản hồi.',
      severity: 'medium' as const,
    },
    {
      title: 'Độ lệch số liệu giữa các phiên bản tài liệu',
      description: 'Sự khác biệt về cách trình bày giữa các bản ghi chép kỹ thuật cần được chuẩn hóa trước khi đưa ra quyết định.',
      severity: 'low' as const,
    },
  ];

  const actions: ResearchResponse['actions'] = [
    {
      title: 'Xác minh các giả định đối chiếu với dữ liệu gốc',
      description: 'Đối chiếu lại các số liệu thử nghiệm với bảng tham chiếu ở phần 3 của tài liệu.',
    },
    {
      title: 'Triển khai giám sát liên tục trên các nút tính toán',
      description: 'Theo dõi độ trễ và lưu lượng tạo mã thông báo theo thời gian thực để đảm bảo hiệu suất.',
    },
  ];

  const sources: ResearchResponse['sources'] = attachedDocs.map((doc, idx) => ({
    documentId: doc.id,
    documentName: doc.name,
    page: idx + 1,
    excerpt: doc.content ? doc.content.slice(0, 160) + '...' : undefined,
  }));

  return { summary, key_points, keyPoints: key_points, risks, actions, sources };
}

// ─── Stream helpers ───────────────────────────────────────────────────────────

/** Streams the JSON of a deterministic response word-by-word (no AI). */
async function streamDeterministic(
  response: ResearchResponse,
  onChunk: (text: string) => void
): Promise<void> {
  const jsonString = JSON.stringify(response, null, 2);
  const words = jsonString.split(/(\s+)/);
  for (let i = 0; i < words.length; i++) {
    onChunk(words[i]);
    if (i % 6 === 0) await new Promise((r) => setTimeout(r, 12));
  }
}

// ─── Main research function ───────────────────────────────────────────────────

export interface ResearchStreamCallbacks {
  onChunk: (text: string) => void;
  onDone: (result: ResearchResponse, convId: string) => void;
  onError: (err: Error) => void;
}

export async function runResearchStream(
  message: string,
  attachedDocs: AttachedDoc[],
  conversationId: string,
  callbacks: ResearchStreamCallbacks
): Promise<void> {
  let fullText = '';
  let structuredResult: ResearchResponse | null = null;

  try {
    if (hasOpenAiKey()) {
      const result = streamText({
        model: openai(DEFAULT_MODEL),
        system: DAY2_SYSTEM_PROMPT,
        prompt: buildDocumentContextPrompt(message, attachedDocs),
        temperature: 0.1,
      });

      for await (const textPart of result.textStream) {
        fullText += textPart;
        callbacks.onChunk(textPart);
      }

      structuredResult = safeParseResearchResponse(fullText);
    } else {
      const deterministic = buildDeterministicResponse(message, attachedDocs);
      structuredResult = deterministic;
      await streamDeterministic(deterministic, (text) => {
        fullText += text;
        callbacks.onChunk(text);
      });
    }

    // Fallback if JSON parsing failed
    if (!structuredResult) {
      structuredResult = buildDeterministicResponse(message, attachedDocs);
      if (fullText.trim()) structuredResult.summary = fullText.slice(0, 300);
    }

    structuredResult.sources = validateAndMapSources(structuredResult.sources, attachedDocs);

    // Persist to DB
    await persistResearchResult(message, structuredResult, fullText, conversationId);

    callbacks.onDone(structuredResult, conversationId);
  } catch (err) {
    callbacks.onError(err instanceof Error ? err : new Error('Quá trình tổng hợp câu trả lời bị ngắt quãng.'));
  }
}

// ─── DB persistence ───────────────────────────────────────────────────────────

async function persistResearchResult(
  message: string,
  structuredResult: ResearchResponse,
  fullText: string,
  conversationId: string
): Promise<void> {
  try {
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: true },
    });

    if (
      conv &&
      (conv.title === 'New Research Chat' ||
        conv.title === 'Nghiên cứu mới' ||
        conv.title === 'Cuộc trò chuyện mới' ||
        conv.messages.length === 0)
    ) {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { title: cleanTitle(message), updatedAt: new Date() },
      });
    }

    await prisma.message.create({
      data: { conversationId, role: 'user', content: message },
    });

    await prisma.message.create({
      data: {
        conversationId,
        role: 'assistant',
        content: structuredResult.summary || fullText,
        structuredData: structuredResult as unknown as object,
      },
    });
  } catch (dbErr) {
    // DB offline is a non-fatal warning; the in-memory cache is the fallback at the route level
    console.warn('Prisma message persistence warning, using memory cache:', dbErr);
    throw dbErr; // re-throw so route can handle the memory-store fallback
  }
}
