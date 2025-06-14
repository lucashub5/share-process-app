import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

export type ProcessNode = {
  id: string;
  title: string;
  content: string | null;
  childrens: ProcessNode[];
};

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
    });

    const buildTree = async (
      process: { id: string; title: string; content: string | null }
    ): Promise<ProcessNode> => {
      const children = await prisma.process.findMany({
        where: { parentId: process.id },
      });

      const childrens: ProcessNode[] = await Promise.all(
        children.map((child) => buildTree(child))
      );

      return {
        id: process.id,
        title: process.title,
        content: process.content,
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
    const { title, content, parentId, clientId } = await req.json();

    if (!title || !clientId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const created = await prisma.process.create({
      data: {
        title,
        content,
        parentId: parentId || null,
        clientId,
      },
    });

    return NextResponse.json({
      id: created.id,
      title: created.title,
      content: created.content,
      childrens: [],
    });
  } catch (error) {
    console.error('[POST /api/processes] Error:', error);
    return NextResponse.json({ error: 'Error creating process' }, { status: 500 });
  }
}