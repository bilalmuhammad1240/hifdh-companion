import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// TODO: replace with real auth session
async function getTeacherId(): Promise<string> {
  const teacher = await prisma.teacherProfile.findFirst();
  return teacher?.id ?? 'demo-teacher';
}

async function getStudents(teacherId: string) {
  const profiles = await prisma.studentProfile.findMany({
    where: { teacherId },
    include: {
      user: { select: { id: true, name: true } },
      hifdhPlans: {
        where: { status: 'ACTIVE' },
        take: 1,
        include: {
          dailyPlans: {
            where: { date: { gte: new Date(new Date().setHours(0,0,0,0)) } },
            take: 1,
            select: { completionStatus: true, isSabaqBlocked: true, warnings: true },
          },
        },
      },
    },
  });

  return profiles.map((p) => {
    const plan = p.hifdhPlans[0];
    const todayPlan = plan?.dailyPlans[0];
    const status = todayPlan?.completionStatus ?? 'PENDING';
    return {
      id: p.id,
      userId: p.userId,
      name: p.user.name,
      planId: plan?.id ?? null,
      todayStatus: status as string,
      isBlocked: todayPlan?.isSabaqBlocked ?? false,
      warnings: (todayPlan?.warnings ?? []) as string[],
    };
  });
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'COMPLETED')  return <CheckCircle className="h-5 w-5 text-day-complete" />;
  if (status === 'PARTIAL')    return <Clock className="h-5 w-5 text-day-partial" />;
  if (status === 'MISSED')     return <XCircle className="h-5 w-5 text-day-missed" />;
  return <Clock className="h-5 w-5 text-text-muted" />;
}

function statusLabel(status: string): string {
  if (status === 'COMPLETED')   return 'Concluído hoje';
  if (status === 'PARTIAL')     return 'Parcialmente concluído';
  if (status === 'MISSED')      return 'Sem atividade hoje';
  if (status === 'IN_PROGRESS') return 'Em andamento';
  return 'Pendente';
}

export default async function TeacherDashboard() {
  const teacherId = await getTeacherId();
  const students = await getStudents(teacherId).catch(() => []);

  const completed = students.filter((s) => s.todayStatus === 'COMPLETED').length;
  const alerts    = students.filter((s) => s.warnings.length > 0 || s.isBlocked).length;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Painel do Professor</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {students.length} aluno(s) · {completed} concluído(s) hoje
          {alerts > 0 && ` · ${alerts} alerta(s)`}
        </p>
      </div>

      {alerts > 0 && (
        <div className="flex items-start gap-2.5 rounded-xl border border-mastery-2 bg-mastery-2/20 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-700" />
          <p className="text-sm text-orange-900">{alerts} aluno(s) precisam de atenção hoje.</p>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Alunos</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-0 divide-y divide-border p-0">
          {students.length === 0 && (
            <p className="p-5 text-sm text-text-muted">Nenhum aluno vinculado ainda.</p>
          )}
          {students.map((s) => (
            <Link
              key={s.id}
              href={`/teacher/students/${s.id}`}
              className="flex items-center gap-3 px-5 py-4 hover:bg-surface-alt transition-colors"
            >
              <StatusIcon status={s.todayStatus} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{s.name}</p>
                <p className={`text-xs ${s.warnings.length > 0 ? 'text-orange-700' : 'text-text-muted'}`}>
                  {s.warnings[0] ?? statusLabel(s.todayStatus)}
                </p>
              </div>
              {s.planId && (
                <span className="shrink-0 text-xs font-medium text-accent hover:underline">
                  Avaliar →
                </span>
              )}
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
