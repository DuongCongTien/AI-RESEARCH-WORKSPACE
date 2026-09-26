import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

let fallbackConversations: Array<{
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Array<{
    id: string;
    conversationId: string;
    role: string;
    content: string;
    structuredResponse: unknown;
    createdAt: Date;
  }>;
}> = [
  {
    id: 'conv-sample-1',
    title: 'Transformer Architecture Analysis',
    createdAt: new Date(),
    updatedAt: new Date(),
    messages: [],
  },
];

export async function GET() {
  try {
    const conversations = await prisma.conversation.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    return NextResponse.json({ success: true, data: conversations });
  } catch (error) {
    console.warn('Prisma DB query failed for conversations, using memory store:', error);
    return NextResponse.json({
      success: true,
      data: fallbackConversations,
      warning: 'Database offline, running with memory store',
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const title = body.title || 'New Research Chat';

    try {
      const conv = await prisma.conversation.create({
        data: { title },
        include: { messages: true },
      });
      return NextResponse.json({ success: true, data: conv });
    } catch (dbError) {
      console.warn('Prisma DB create conversation failed, storing in memory:', dbError);
      const newConv = {
        id: `conv-${Date.now()}`,
        title,
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
      };
      fallbackConversations.unshift(newConv);
      return NextResponse.json({ success: true, data: newConv });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
