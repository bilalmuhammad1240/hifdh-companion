import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';

async function getPendingReviews() {
  const teacher = await prisma.teacherProfile.findFirst();
  if (!teacher) return [];

  const students = await prisma.studentProfile.findMany({
    where: { teacherId: teacher.id },
    include: {
      user: { select: { name: true } },
      hifdhPlans: {
        where: { status: 'ACTIVE' },
        take: 1,
        include: {
          dailyPlans: {
            where: {
              date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
              completionStatus: { in: ['COMPLETED', 'PARTIAL'] },
            },
            take: 1,
            select: { id: true, sabaqPages: true, completionStatus: true },
          },
        },
      },
    },
  });

  return students
    .filter((s) => (s.hifdhPlans[0]?.dailyPlans.length ?? 0) > 0)
    .map((s) => ({
      studentId: s.id,
      studentName: s.user.name,
      planId: s.hifdhPlans[0]!.id,
      sabaqPages: (s.hifdhPlans[0]!.dailyPlans[0]?.sabaqPages ?? []) as number[],
    }));
}

export default async function ReviewPage() {
  const pending = await getPendingReviews().catch(() => []);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold text-text-primary">Avaliar Recitações</h1>
      <p className="text-sm text-text-secondary">{pending.length} aluno(s) aguardando avaliação hoje</p>

      {pending.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <ClipboardList className="h-10 w-10 text-text-muted" />
          <p className="text-text-secondary">Nenhuma avaliação pendente no momento.</p>
        </div>
      ) : (
        <Card>
          <CardHeader><CardTitle>Pendentes hoje</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-0 divide-y divide-border p-0">
            {pending.map((p) => (
              <Link
                key={p.studentId}
                href={`/teacher/students/${p.studentId}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-surface-alt transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">{p.studentName}</p>
                  <p className="text-xs text-text-muted">
                    Sabaq: págs. {p.sabaqPages.join(', ') || '—'}
                  </p>
                </div>
                <span className="text-xs font-medium text-accent">Avaliar →</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
