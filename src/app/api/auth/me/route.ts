import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('session')?.value;
  if (!token) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          id: true, name: true, email: true, role: true,
          studentProfile: { select: { id: true, teacherId: true, madrassahId: true } },
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Sessão expirada' }, { status: 401 });
  }

  return NextResponse.json({ user: session.user });
}
