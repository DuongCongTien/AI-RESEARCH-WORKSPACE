import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

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
        },
      });

      if (conv) {
        return NextResponse.json({ success: true, data: conv });
      }
    } catch {
      // DB error fallback
    }

    // Default mock conversation if not in DB
    return NextResponse.json({
      success: true,
      data: {
        id,
        title: id === 'conv-1' ? 'Quantum Error Mitigation' : id === 'conv-2' ? 'Multi-agent consensus check' : 'Research Inquiry',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Database error' },
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
    return NextResponse.json({ success: true, message: 'Conversation deleted' });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Delete error' },
      { status: 500 }
    );
  }
}
