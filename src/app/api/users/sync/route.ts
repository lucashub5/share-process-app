import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const existing = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!existing) {
    await prisma.user.create({
      data: {
        email: session.user.email,
        name: session.user.name || "",
      },
    });
  }

  return NextResponse.json({ success: true });
}
