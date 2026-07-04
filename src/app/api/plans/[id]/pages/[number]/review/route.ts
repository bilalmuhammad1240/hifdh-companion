import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { container } from '@/lib/container';
import { TeacherRating } from '@/domain/entities/PageMastery';

const reviewSchema = z.object({
  errorCount: z.number().int().min(0),
  recitationSeconds: z.number().int().min(0).optional(),
  teacherRating: z.nativeEnum(TeacherRating).optional().nullable(),
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
    const parsed = reviewSchema.parse(body);

    const result = await container.useCases.completeReview.execute({
      planId: id,
      pageNumber,
      errorCount: parsed.errorCount,
      recitationSeconds: parsed.recitationSeconds,
      teacherRating: parsed.teacherRating ?? null,
      studentNotes: parsed.studentNotes,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
