import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/container';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string; date: string } }
) {
  try {
    const { id, date } = params;
    const parsedDate = date === 'today' ? new Date() : new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: 'Data inválida' }, { status: 400 });
    }

    const dailyPlan = await container.useCases.getDailyPlan.execute({
      planId: id,
      date: parsedDate,
    });

    return NextResponse.json(dailyPlan);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
