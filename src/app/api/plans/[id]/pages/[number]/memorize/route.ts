import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { container } from '@/lib/container';

const memorizeSchema = z.object({
  difficulty: z.enum(['easy', 'normal', 'hard']),
  studentNotes: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; number: string }> }
) {
  try {
    const { id, number } = await params;
    const pageNumber = Number(number);
    if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > 604) {
      return NextResponse.json({ error: 'Número de página inválido' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = memorizeSchema.parse(body);

    await container.useCases.markPageMemorized.execute({
      planId: id,
      pageNumber,
      difficulty: parsed.difficulty,
      studentNotes: parsed.studentNotes,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
