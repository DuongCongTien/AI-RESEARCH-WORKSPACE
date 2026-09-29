import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDatabaseAvailable } from '@/lib/prisma';
import { getSharedDocuments } from '@/lib/documents/cache';
import {
  addSharedMessage,
  updateSharedConversation,
  addSharedConversation,
  getSharedConversations,
} from '@/lib/conversations/cache';
import { ConversationItem, MessageItemType } from '@/types';
import {
  cleanTitle,
  validateAndMapSources,
  buildDeterministicResponse,
  AttachedDoc,
} from '@/lib/ai/research';
import { getAiModel, hasAiKey } from '@/lib/ai/client';
import { DAY2_SYSTEM_PROMPT, buildDocumentContextPrompt } from '@/lib/ai/prompt';
import { streamText } from 'ai';
import { ResearchResponse, safeParseResearchResponse } from '@/types/research';

// ─── Document lookup ──────────────────────────────────────────────────────────

async function fetchAttachedDocs(documentIds: string[]): Promise<AttachedDoc[]> {
  if (await isDatabaseAvailable()) {
    try {
      const found = await prisma.document.findMany({
        where: { id: { in: documentIds } },
      });
      if (found.length > 0) {
        return found.map((d) => ({
          id: d.id,
          name: d.name,
          content: (d.content || d.textContent || '').trim(),
        }));
      }
    } catch (dbErr) {
      console.warn('Prisma document lookup fallback notice:', dbErr);
    }
  }

  // In-memory fallback when DB is offline
  const sharedDocs = getSharedDocuments();
  return sharedDocs
    .filter((d) => documentIds.includes(d.id))
    .map((d) => ({
      id: d.id,
      name: d.name,
      content: (d.content || d.textContent || '').trim(),
    }));
}

// ─── Conversation creation ────────────────────────────────────────────────────

async function ensureConversation(
  conversationId: string | undefined,
  message: string,
  documentIds: string[]
): Promise<string> {
  if (conversationId) return conversationId;

  const newId = `conv-${Date.now()}`;
  if (await isDatabaseAvailable()) {
    try {
      await prisma.conversation.create({
        data: { id: newId, title: cleanTitle(message) },
      });
      return newId;
    } catch {
      // Fallback to shared in-memory storage below
    }
  }

  addSharedConversation({
    id: newId,
    title: cleanTitle(message),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [],
    documentIds,
  });
  return newId;
}

// ─── Message persistence ──────────────────────────────────────────────────────

async function persistMessages(
  conversationId: string,
  message: string,
  structuredResult: ResearchResponse,
  fullText: string
): Promise<void> {
  if (await isDatabaseAvailable()) {
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
      return;
    } catch (dbErr) {
      console.warn('Prisma persistence warning, falling back to memory cache:', dbErr);
    }
  }

  addSharedMessage(conversationId, {
    id: `user-${Date.now()}`,
    conversationId,
    role: 'user',
    content: message,
    createdAt: new Date().toISOString(),
  });
  addSharedMessage(conversationId, {
    id: `asst-${Date.now()}`,
    conversationId,
    role: 'assistant',
    content: structuredResult.summary || fullText,
    structuredResponse: structuredResult,
    createdAt: new Date().toISOString(),
  });
  updateSharedConversation(conversationId, (c) => ({
    ...c,
    title:
      c.title === 'New Research Chat' || c.title === 'Nghiên cứu mới'
        ? cleanTitle(message)
        : c.title,
    updatedAt: new Date().toISOString(),
  }));
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { documentIds = [], message, conversationId } = body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Câu hỏi không được để trống.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tải lên ít nhất một tài liệu để bắt đầu nghiên cứu.' },
        { status: 400 }
      );
    }

    const attachedDocs = await fetchAttachedDocs(documentIds);

    if (attachedDocs.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy các tài liệu đã chọn trong không gian làm việc.' },
        { status: 404 }
      );
    }

    if (!attachedDocs.some((d) => d.content.length > 0)) {
      return NextResponse.json(
        { success: false, error: 'Tài liệu này không chứa văn bản đọc được.' },
        { status: 400 }
      );
    }

    const activeConvId = await ensureConversation(conversationId, message.trim(), documentIds);

    // Fetch previous conversation history for multi-turn awareness
    let historyMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    if (await isDatabaseAvailable()) {
      try {
        const prevMsgs = await prisma.message.findMany({
          where: { conversationId: activeConvId },
          orderBy: { createdAt: 'asc' },
          take: 12,
        });
        if (prevMsgs.length > 0) {
          historyMessages = prevMsgs.map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }));
        }
      } catch (dbErr) {
        console.warn('Prisma history lookup notice:', dbErr);
      }
    }
    if (historyMessages.length === 0) {
      const sharedConv = getSharedConversations().find((c: ConversationItem) => c.id === activeConvId);
      if (sharedConv && sharedConv.messages) {
        historyMessages = sharedConv.messages.slice(-12).map((m: MessageItemType) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));
      }
    }

    const prompt = buildDocumentContextPrompt(message.trim(), attachedDocs, historyMessages);
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let fullText = '';
        let structuredResult: ResearchResponse | null = null;

        const send = (obj: object) =>
          controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'));

        try {
          if (hasAiKey()) {
            const result = streamText({
              model: getAiModel(),
              system: DAY2_SYSTEM_PROMPT,
              prompt,
              temperature: 0.1,
            });
            for await (const textPart of result.textStream) {
              fullText += textPart;
              send({ type: 'chunk', text: textPart });
            }
            structuredResult = safeParseResearchResponse(fullText);
          } else {
            const deterministic = buildDeterministicResponse(message.trim(), attachedDocs);
            structuredResult = deterministic;
            const words = JSON.stringify(deterministic, null, 2).split(/(\s+)/);
            for (let i = 0; i < words.length; i++) {
              fullText += words[i];
              send({ type: 'chunk', text: words[i] });
              if (i % 6 === 0) await new Promise((r) => setTimeout(r, 12));
            }
          }

          if (!structuredResult) {
            if (fullText.trim()) {
              structuredResult = {
                summary: fullText.trim(),
                key_points: [`Tổng hợp trực tiếp từ: ${attachedDocs.map((d) => d.name).join(', ')}`],
                keyPoints: [`Tổng hợp trực tiếp từ: ${attachedDocs.map((d) => d.name).join(', ')}`],
                risks: [],
                actions: [],
                sources: attachedDocs.map((doc, idx) => ({
                  documentId: doc.id,
                  documentName: doc.name,
                  page: idx + 1,
                  excerpt: doc.content ? doc.content.slice(0, 180) + '...' : undefined,
                })),
              };
            } else {
              structuredResult = buildDeterministicResponse(message.trim(), attachedDocs);
            }
          }

          structuredResult.sources = validateAndMapSources(structuredResult.sources, attachedDocs);

          await persistMessages(activeConvId, message.trim(), structuredResult, fullText);

          send({
            type: 'done',
            structuredResponse: structuredResult,
            content: structuredResult.summary || fullText,
            conversationId: activeConvId,
          });
        } catch (streamError) {
          console.error('Streaming pipeline error:', streamError);
          send({
            type: 'error',
            error:
              streamError instanceof Error
                ? streamError.message
                : 'Quá trình tổng hợp câu trả lời bị ngắt quãng.',
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Lỗi hệ thống nghiên cứu AI.' },
      { status: 500 }
    );
  }
}
