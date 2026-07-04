import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

async function getStudents() {
  const teacher = await prisma.teacherProfile.findFirst();
  if (!teacher) return [];
  return prisma.studentProfile.findMany({
    where: { teacherId: teacher.id },
    include: {
      user: { select: { name: true, email: true } },
      hifdhPlans: {
        where: { status: 'ACTIVE' },
        take: 1,
        select: { id: true, goalJuzEnd: true, goalJuzStart: true },
      },
    },
  });
}

export default async function StudentsPage() {
  const students = await getStudents().catch(() => []);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold text-text-primary">Meus Alunos</h1>

      {students.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Users className="h-10 w-10 text-text-muted" />
          <p className="text-text-secondary">Nenhum aluno vinculado ainda.</p>
          <p className="text-sm text-text-muted">Compartilhe seu código da madrassah para que alunos se conectem.</p>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col gap-0 divide-y divide-border p-0">
            {students.map((s) => {
              const plan = s.hifdhPlans[0];
              return (
                <Link
                  key={s.id}
                  href={`/teacher/students/${s.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-surface-alt transition-colors"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-light text-accent font-semibold text-sm">
                    {s.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">{s.user.name}</p>
                    <p className="text-xs text-text-muted truncate">{s.user.email}</p>
                  </div>
                  {plan && (
                    <span className="shrink-0 text-xs text-text-muted">
                      {plan.goalJuzStart}–{plan.goalJuzEnd} Juz'
                    </span>
                  )}
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
