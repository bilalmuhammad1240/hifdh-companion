import { NextResponse } from 'next/server';
import { MUSHAF_PAGES } from '@/infrastructure/data/generateMushafPages';

export async function GET() {
  return NextResponse.json({ pages: MUSHAF_PAGES, total: MUSHAF_PAGES.length });
}
