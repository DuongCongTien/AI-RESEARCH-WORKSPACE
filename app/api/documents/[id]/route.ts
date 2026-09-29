import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDatabaseAvailable } from '@/lib/prisma';
import { getSharedDocumentById, updateSharedDocument } from '@/lib/documents/cache';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (await isDatabaseAvailable()) {
      try {
        const doc = await prisma.document.findUnique({
          where: { id },
          include: { chunks: true },
        });

        if (doc) {
          return NextResponse.json({ success: true, data: doc });
        }
      } catch (dbErr) {
        console.warn('Prisma document fetch warning, falling back to cache:', dbErr);
      }
    }

    const cachedDoc = getSharedDocumentById(id);
    if (!cachedDoc) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy tài liệu' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: cachedDoc });
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

    if (await isDatabaseAvailable()) {
      try {
        const updated = await prisma.document.update({
          where: { id },
          data: {
            ...(typeof body.inContext === 'boolean' && { inContext: body.inContext }),
            ...(body.status && { status: body.status }),
            ...(typeof body.progress === 'number' && { progress: body.progress }),
          },
        });

        return NextResponse.json({ success: true, data: updated });
      } catch (dbErr) {
        console.warn('Prisma document update warning, falling back to cache:', dbErr);
      }
    }

    const updatedCached = updateSharedDocument(id, (doc) => ({
      ...doc,
      ...(typeof body.inContext === 'boolean' && { inContext: body.inContext }),
      ...(body.status && { status: body.status }),
      ...(typeof body.progress === 'number' && { progress: body.progress }),
      ...(body.step !== undefined && { step: body.step }),
      ...(body.errorMsg !== undefined && { errorMsg: body.errorMsg }),
      ...(body.errorCode !== undefined && { errorCode: body.errorCode }),
    }));

    if (!updatedCached) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy tài liệu để cập nhật' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedCached });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Cập nhật thất bại' },
      { status: 500 }
    );
  }
}
