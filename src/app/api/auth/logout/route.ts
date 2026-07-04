import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('session')?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } }).catch(() => null);
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set('session', '', { maxAge: 0, path: '/' });
  return response;
}
