import { NextRequest, NextResponse } from 'next/server';
import { getPagesForJuz } from '@/infrastructure/data/generateMushafPages';

export async function GET(
  _req: NextRequest,
  { params }: { params: { number: string } }
) {
  const juz = Number(params.number);
  if (!Number.isInteger(juz) || juz < 1 || juz > 30) {
    return NextResponse.json({ error: "Juz' inválido" }, { status: 400 });
  }
  return NextResponse.json({ juz, pages: getPagesForJuz(juz) });
}
