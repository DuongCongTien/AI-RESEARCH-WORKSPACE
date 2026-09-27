import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import {
  getSharedConversationById,
  deleteSharedConversation,
  updateSharedConversation,
} from '@/lib/conversations/cache';
import { safeParseResearchResponse } from '@/types/research';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    try {
      const conv = await prisma.conversation.findUnique({
        where: { id },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
          conversationDocuments: {
            include: { document: true },
          },
        },
      });

      if (conv) {
        return NextResponse.json({
          success: true,
          data: {
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
          },
        });
      }
    } catch (dbErr) {
      console.warn('Prisma conversation by ID fetch warning:', dbErr);
    }

    // Check shared memory store
    const cached = getSharedConversationById(id);
    if (cached) {
      return NextResponse.json({ success: true, data: cached });
    }

    // Create transient instance if not found
    const transient = {
      id,
      title: 'Cuộc trò chuyện mới',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
      documentIds: [],
    };

    return NextResponse.json({ success: true, data: transient });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Lỗi cơ sở dữ liệu' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { title } = body;

    try {
      const updated = await prisma.conversation.update({
        where: { id },
        data: {
          title: title || undefined,
          updatedAt: new Date(),
        },
      });
      return NextResponse.json({ success: true, data: updated });
    } catch {
      // Memory store fallback
      const updated = updateSharedConversation(id, (c) => ({
        ...c,
        title: title || c.title,
        updatedAt: new Date().toISOString(),
      }));
      return NextResponse.json({ success: true, data: updated });
    }
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Lỗi cập nhật' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    try {
      await prisma.conversation.delete({ where: { id } });
    } catch {
      // Ignore if not present in DB
    }
    deleteSharedConversation(id);
    return NextResponse.json({ success: true, message: 'Đã xóa cuộc trò chuyện' });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Lỗi xóa' },
      { status: 500 }
    );
  }
}
