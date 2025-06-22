import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Obtener clientes donde el usuario es creador O tiene acceso
    const clients = await prisma.client.findMany({
      where: {
        OR: [
          { creatorId: session.user.id },
          {
            accesses: {
              some: {
                userId: session.user.id
              }
            }
          }
        ]
      },
      include: {
        accesses: {
          where: {
            userId: session.user.id
          },
          select: {
            canEdit: true,
            canDelete: true,
            canCreate: true,
            userId: true
          }
        }
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Error al obtener clientes" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { name } = await req.json();

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Nombre inválido" },
        { status: 400 }
      );
    }

    const newClient = await prisma.client.create({
      data: {
        name: name.trim(),
        creatorId: session.user.id,
      },
      include: {
        accesses: {
          where: {
            userId: session.user.id
          },
          select: {
            canEdit: true,
            canDelete: true,
            canCreate: true,
            userId: true
          }
        }
      }
    });

    return NextResponse.json(newClient);
  } catch (error) {
    console.error("Error creando cliente:", error);
    return NextResponse.json(
      { error: "Error al crear cliente" },
      { status: 500 }
    );
  }
}