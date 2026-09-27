import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import {
  getSharedConversations,
  addSharedConversation,
} from '@/lib/conversations/cache';
import { safeParseResearchResponse } from '@/types/research';

export async function GET() {
  try {
    const dbConvs = await prisma.conversation.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        conversationDocuments: {
          include: { document: true },
        },
      },
    });

    const formatted = dbConvs.map((conv) => ({
      id: conv.id,
      title: conv.title,
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
      documentIds: conv.conversationDocuments?.map((cd) => cd.documentId) || [],
      messages: conv.messages.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
        structuredResponse: safeParseResearchResponse(m.structuredData),
        createdAt: m.createdAt.toISOString(),
      })),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.warn('Prisma DB query failed for conversations, using memory store:', error);
    const fallback = getSharedConversations();
    return NextResponse.json({
      success: true,
      data: fallback,
      warning: 'Database offline, running with memory store',
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const title = body.title || 'New Research Chat';
    const documentIds: string[] = Array.isArray(body.documentIds) ? body.documentIds : [];

    try {
      const conv = await prisma.conversation.create({
        data: {
          title,
          conversationDocuments: documentIds.length > 0
            ? {
                create: documentIds.map((docId) => ({
                  documentId: docId,
                })),
              }
            : undefined,
        },
        include: {
          messages: true,
          conversationDocuments: true,
        },
      });

      const formatted = {
        id: conv.id,
        title: conv.title,
        createdAt: conv.createdAt.toISOString(),
        updatedAt: conv.updatedAt.toISOString(),
        documentIds: conv.conversationDocuments?.map((cd) => cd.documentId) || [],
        messages: [],
      };

      return NextResponse.json({ success: true, data: formatted });
    } catch (dbError) {
      console.warn('Prisma DB create conversation failed, storing in memory:', dbError);
      const newConv = {
        id: `conv-${Date.now()}`,
        title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        documentIds,
        messages: [],
      };
      addSharedConversation(newConv);
      return NextResponse.json({ success: true, data: newConv });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
