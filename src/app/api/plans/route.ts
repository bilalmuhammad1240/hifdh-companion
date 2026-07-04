import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { container } from '@/lib/container';

const createPlanSchema = z.object({
  studentId: z.string().min(1),
  goalJuzStart: z.number().int().min(1).max(30),
  goalJuzEnd: z.number().int().min(1).max(30),
  newPagesPerDay: z.number().min(0.5).max(10),
  studyDays: z.array(z.number().int().min(1).max(7)).min(1),
  startDate: z.string().datetime(),
  targetEndDate: z.string().datetime().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createPlanSchema.parse(body);

    const result = await container.useCases.createHifdhPlan.execute({
      studentId: parsed.studentId,
      goalJuzStart: parsed.goalJuzStart,
      goalJuzEnd: parsed.goalJuzEnd,
      newPagesPerDay: parsed.newPagesPerDay,
      studyDays: parsed.studyDays,
      startDate: new Date(parsed.startDate),
      targetEndDate: parsed.targetEndDate ? new Date(parsed.targetEndDate) : undefined,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
