import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const url = new URL(req.url);
  const clientId = url.searchParams.get('clientId');

  if (!clientId) {
    return NextResponse.json(
      { error: 'clientId is required as query parameter' },
      { status: 400 }
    );
  }

  try {
    const process = await prisma.process.findUnique({ where: { id } });

    if (!process || process.clientId !== clientId) {
      return NextResponse.json(
        { error: 'Process not found for this client' },
        { status: 404 }
      );
    }

    const deleteRecursively = async (processId: string) => {
      const children = await prisma.process.findMany({
        where: { parentId: processId },
      });

      for (const child of children) {
        await deleteRecursively(child.id);
      }

      await prisma.process.delete({ where: { id: processId } });
    };

    await deleteRecursively(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/processes/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Error deleting process' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const url = new URL(req.url);
  const clientId = url.searchParams.get('clientId');

  if (!clientId) {
    return NextResponse.json(
      { error: 'clientId is required as query parameter' },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const { content, title } = body;

    const process = await prisma.process.findUnique({ where: { id } });

    if (!process || process.clientId !== clientId) {
      return NextResponse.json(
        { error: 'Process not found for this client' },
        { status: 404 }
      );
    }

    const updatedProcess = await prisma.process.update({
      where: { id },
      data: { content, title },
    });

    return NextResponse.json(updatedProcess);
  } catch (error) {
    console.error('[PUT /api/processes/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Error updating process' },
      { status: 500 }
    );
  }
}