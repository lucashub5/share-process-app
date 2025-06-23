import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const clients = await prisma.client.findMany({
      where: {
        OR: [
          { creatorId: session.user.id },
          {
            accesses: {
              some: { userId: session.user.id }
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
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                imageUrl: true,
                imageId: true,
              }
            },
            state: true,
            joinedAt: true,
            permissions: {
              select: {
                scope: true,
                action: true,
                allowed: true
              }
            }
          }
        }
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json({ error: "Error al obtener clientes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { name } = await req.json();

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });
    }

    const newClient = await prisma.client.create({
      data: {
        name: name.trim(),
        creatorId: session.user.id,
        accesses: {
          create: {
            userId: session.user.id,
            state: "accepted",
            joinedAt: new Date(),
            permissions: {
              create: [
                { scope: "users", action: "invite", allowed: true },
                { scope: "users", action: "remove", allowed: true },
                { scope: "users", action: "grant", allowed: true },
                { scope: "processes", action: "edit", allowed: true },
                { scope: "processes", action: "delete", allowed: true },
                { scope: "processes", action: "create", allowed: true },
                { scope: "documents", action: "edit", allowed: true },
                { scope: "documents", action: "delete", allowed: true },
                { scope: "documents", action: "create", allowed: true },
              ]
            }
          }
        }
      },
      include: {
        accesses: {
          where: {
            userId: session.user.id
          },
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                imageUrl: true,
                imageId: true,
              }
            },
            state: true,
            joinedAt: true,
            permissions: {
              select: {
                scope: true,
                action: true,
                allowed: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(newClient);
  } catch (error) {
    console.error("Error creando cliente:", error);
    return NextResponse.json({ error: "Error al crear cliente" }, { status: 500 });
  }
}

