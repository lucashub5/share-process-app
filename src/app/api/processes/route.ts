import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { DocumentType, Process } from '@/types/types';

const prisma = new PrismaClient();

// GET - obtener árbol por clientId
export async function GET(req: NextRequest) {
  try {
    const clientId = req.nextUrl.searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json({ error: 'Missing clientId parameter' }, { status: 400 });
    }

    const rootProcesses = await prisma.process.findMany({
      where: { parentId: null, clientId },
      select: {
        id: true,
        title: true,
        content: true,
        type: true, 
        parentId: true
      },
    });

    const buildTree = async (
      process: { id: string; title: string; content: string | null; type: DocumentType, parentId: string | null }
    ): Promise<Process> => {
      const children = await prisma.process.findMany({
        where: { parentId: process.id },
        select: {
          id: true,
          title: true,
          content: true,
          type: true,
          parentId: true
        },
      });

      const childrens: Process[] = await Promise.all(
        children.map((child) => buildTree(child))
      );

      return {
        id: process.id,
        title: process.title,
        content: process.content,
        type: process.type, 
        parentId: process.parentId,
        childrens,
      };
    };

    const tree = await Promise.all(rootProcesses.map((p) => buildTree(p)));

    return NextResponse.json(tree);
  } catch (error) {
    console.error('[GET /api/processes] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - crear proceso
export async function POST(req: NextRequest) {
  try {
    const { title, content, parentId, type } = await req.json();

    const url = new URL(req.url);
    const clientId = url.searchParams.get('clientId');

    if (!title || !clientId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const created = await prisma.process.create({
      data: {
        title,
        content,
        parentId: parentId || null,
        clientId,
        type,
      },
    });

    return NextResponse.json({
      id: created.id,
      title: created.title,
      content: created.content,
      type: created.type,
      childrens: [],
    });
  } catch (error) {
    console.error('[POST /api/processes] Error:', error);
    return NextResponse.json({ error: 'Error creating process' }, { status: 500 });
  }
}