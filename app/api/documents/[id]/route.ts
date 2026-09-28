import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = await prisma.document.findUnique({
      where: { id },
      include: { chunks: true },
    });

    if (!doc) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy tài liệu' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: doc });
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
    const body = await req.json();

    const updated = await prisma.document.update({
      where: { id },
      data: {
        ...(typeof body.inContext === 'boolean' && { inContext: body.inContext }),
        ...(body.status && { status: body.status }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Cập nhật thất bại' },
      { status: 500 }
    );
  }
}
