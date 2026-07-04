import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { TeacherRatingForm } from '@/components/session/TeacherRatingForm';
import { PageStatusBadge } from '@/components/shared/PageStatusBadge';

interface PageProps {
  params: { id: string };
}

async function getStudentData(profileId: string) {
  const profile = await prisma.studentProfile.findUnique({
    where: { id: profileId },
    include: {
      user: { select: { name: true, email: true } },
      hifdhPlans: {
        where: { status: 'ACTIVE' },
        take: 1,
        include: {
          config: true,
          dailyPlans: {
            orderBy: { date: 'desc' },
            take: 1,
          },
          pages: {
            where: { status: { not: 'NOT_STARTED' } },
            orderBy: { masteryLevel: 'asc' },
            take: 10,
            select: {
              pageNumber: true, masteryLevel: true, status: true,
              totalErrors: true, totalReviews: true, lastTeacherRating: true,
            },
          },
        },
      },
    },
  });
  return profile;
}

export default async function StudentDetailPage({ params }: PageProps) {
  const { id } = params;
  const data = await getStudentData(id).catch(() => null);

  if (!data) {
    return (
      <div className="flex flex-col gap-4 py-16 text-center">
        <p className="text-text-secondary">Aluno não encontrado.</p>
        <Link href="/teacher/dashboard" className="text-sm text-accent hover:underline">← Voltar</Link>
      </div>
    );
  }

  const plan = data.hifdhPlans[0];
  const todayPlan = plan?.dailyPlans[0];
  const weakPages = data.hifdhPlans[0]?.pages ?? [];
  const totalMemorized = await prisma.pageProgress.count({
    where: { planId: plan?.id, status: { not: 'NOT_STARTED' } },
  }).catch(() => 0);
  const totalGoal = plan ? plan.goalPageEnd - plan.goalPageStart + 1 : 604;
  const percent = totalGoal > 0 ? Math.round((totalMemorized / totalGoal) * 100) : 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/teacher/dashboard" className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-alt text-text-secondary hover:text-text-primary">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-text-primary">{data.user.name}</h1>
          <p className="text-sm text-text-secondary">{data.user.email}</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Progresso</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">{totalMemorized} de {totalGoal} páginas</span>
            <span className="font-mono text-sm font-bold text-accent">{percent}%</span>
          </div>
          <ProgressBar value={percent} />
        </CardContent>
      </Card>

      {todayPlan && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-accent" />
              <CardTitle>Plano de hoje</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {[
              { label: 'Sabaq',  pages: (todayPlan.sabaqPages  as number[]) },
              { label: 'Sabqi',  pages: (todayPlan.sabqiPages  as number[]) },
              { label: 'Manzil', pages: (todayPlan.manzilPages as number[]) },
            ].map(({ label, pages }) => (
              <div key={label} className="flex items-center justify-between rounded-xl bg-surface-alt px-3 py-2.5">
                <span className="text-sm font-medium text-text-primary">{label}</span>
                <span className="text-sm font-mono text-text-secondary">
                  {pages.length > 0 ? pages.join(', ') : '—'}
                </span>
              </div>
            ))}
            {todayPlan.isSabaqBlocked && (
              <p className="text-xs text-orange-700 mt-1">{todayPlan.explanation}</p>
            )}
          </CardContent>
        </Card>
      )}

      {plan && (
        <TeacherRatingForm
          planId={plan.id}
          studentName={data.user.name}
          sabaqPages={(todayPlan?.sabaqPages as number[]) ?? []}
        />
      )}

      {weakPages.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Páginas mais fracas</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            {weakPages.map((p) => (
              <div key={p.pageNumber} className="flex items-center justify-between rounded-xl bg-surface-alt px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium text-text-primary">Pág. {p.pageNumber}</span>
                  <PageStatusBadge masteryLevel={p.masteryLevel} isForgotten={p.status === 'FORGOTTEN'} />
                </div>
                <span className="text-xs text-text-muted">
                  {p.totalReviews} rev · {p.totalErrors} erros
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
