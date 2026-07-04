'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ChevronRight, ChevronLeft, BookOpen, Calendar, Target, Clock, CheckCircle } from 'lucide-react';

type Goal = 1 | 5 | 10 | 18 | 30;
type DayId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface OnboardingState {
  goal: Goal;
  startJuz: number;
  newPagesPerDay: number;
  studyDays: DayId[];
  startDate: string;
  targetEndDate: string;
}

const GOAL_OPTIONS: { value: Goal; label: string; pages: number }[] = [
  { value: 30, label: '30 Juz\' — Quran completo', pages: 604 },
  { value: 18, label: '18 Juz\'', pages: 360 },
  { value: 10, label: '10 Juz\'', pages: 200 },
  { value: 5,  label: '5 Juz\'', pages: 100 },
  { value: 1,  label: '1 Juz\'', pages: 20 },
];

const PAGES_OPTIONS = [0.5, 1, 1.5, 2, 3, 4];

const DAYS: { id: DayId; short: string; label: string }[] = [
  { id: 1, short: 'Dom', label: 'Domingo' },
  { id: 2, short: 'Seg', label: 'Segunda' },
  { id: 3, short: 'Ter', label: 'Terça' },
  { id: 4, short: 'Qua', label: 'Quarta' },
  { id: 5, short: 'Qui', label: 'Quinta' },
  { id: 6, short: 'Sex', label: 'Sexta' },
  { id: 7, short: 'Sáb', label: 'Sábado' },
];

function calcProjection(totalPages: number, pagesPerDay: number, studyDaysPerWeek: number): string {
  if (pagesPerDay <= 0 || studyDaysPerWeek <= 0) return '—';
  const studyDaysNeeded = Math.ceil(totalPages / pagesPerDay);
  const weeks = Math.ceil(studyDaysNeeded / studyDaysPerWeek);
  const months = Math.floor(weeks / 4.33);
  const remWeeks = Math.round(weeks % 4.33);
  if (months === 0) return `${remWeeks} semana(s)`;
  if (remWeeks === 0) return `${months} mês/meses`;
  return `${months} mês/meses e ${remWeeks} semana(s)`;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0] as string;

  const [state, setState] = useState<OnboardingState>({
    goal: 30,
    startJuz: 1,
    newPagesPerDay: 1,
    studyDays: [2, 3, 4, 5, 6],
    startDate: today,
    targetEndDate: '',
  });

  const totalPages = (GOAL_OPTIONS.find((o) => o.value === state.goal)?.pages ?? 604);
  const projection = calcProjection(totalPages, state.newPagesPerDay, state.studyDays.length);

  function toggleDay(id: DayId) {
    setState((s) => ({
      ...s,
      studyDays: s.studyDays.includes(id)
        ? s.studyDays.filter((d) => d !== id)
        : [...s.studyDays, id].sort(),
    }));
  }

  async function handleFinish() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: 'current', // will be replaced by auth session on server
          goalJuzStart: state.startJuz,
          goalJuzEnd: state.goal,
          newPagesPerDay: state.newPagesPerDay,
          studyDays: state.studyDays,
          startDate: new Date(state.startDate).toISOString(),
          targetEndDate: state.targetEndDate
            ? new Date(state.targetEndDate).toISOString()
            : undefined,
        }),
      });
      if (res.ok) {
        router.push('/dashboard');
      } else {
        const data = await res.json();
        setError(data.error ?? 'Erro ao criar plano.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Progress indicator */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs text-text-muted">
          <span>Passo {step} de 5</span>
          <span>{Math.round((step / 5) * 100)}%</span>
        </div>
        <ProgressBar value={(step / 5) * 100} />
      </div>

      {/* Step 1 — Goal */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-light">
              <Target className="h-5 w-5 text-accent" />
            </div>
            <CardTitle>Qual é sua meta?</CardTitle>
            <CardDescription>Quantos Juz' você deseja memorizar?</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {GOAL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setState((s) => ({ ...s, goal: opt.value }))}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                  state.goal === opt.value
                    ? 'border-accent bg-accent-light text-accent font-medium'
                    : 'border-border bg-surface text-text-primary hover:bg-surface-alt'
                }`}
              >
                <span>{opt.label}</span>
                <span className="text-xs text-text-muted">{opt.pages} páginas</span>
              </button>
            ))}
            <div className="mt-2 rounded-xl bg-surface-alt p-3">
              <p className="text-xs text-text-secondary">
                Recomendado para iniciantes: começar pelo <strong>Juz' 30</strong> (último Juz', páginas 581–604).
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2 — Pace */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-light">
              <BookOpen className="h-5 w-5 text-accent" />
            </div>
            <CardTitle>Seu ritmo diário</CardTitle>
            <CardDescription>Quantas páginas novas por dia?</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-2">
              {PAGES_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => setState((s) => ({ ...s, newPagesPerDay: n }))}
                  className={`rounded-xl border py-3 text-center text-sm font-medium transition-colors ${
                    state.newPagesPerDay === n
                      ? 'border-accent bg-accent text-white'
                      : 'border-border bg-surface text-text-primary hover:bg-surface-alt'
                  }`}
                >
                  {n === 0.5 ? '½' : n}
                </button>
              ))}
            </div>
            <div className="rounded-xl bg-surface-alt p-3 text-sm text-text-secondary">
              <p className="font-medium text-text-primary">Guia de ritmo:</p>
              <ul className="mt-1 space-y-0.5 text-xs">
                <li>½–1 pág/dia — Ritmo conservador, qualidade máxima</li>
                <li>1–2 pág/dia — Ritmo padrão das madrassahs</li>
                <li>3–4 pág/dia — Ritmo intensivo (tempo integral)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3 — Study days */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-light">
              <Calendar className="h-5 w-5 text-accent" />
            </div>
            <CardTitle>Dias de estudo</CardTitle>
            <CardDescription>Quais dias você vai estudar cada semana?</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-7 gap-1.5">
              {DAYS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => toggleDay(d.id)}
                  className={`rounded-xl border py-2.5 text-center text-xs font-medium transition-colors ${
                    state.studyDays.includes(d.id)
                      ? 'border-accent bg-accent text-white'
                      : 'border-border bg-surface text-text-secondary hover:bg-surface-alt'
                  }`}
                >
                  {d.short}
                </button>
              ))}
            </div>
            <p className="text-sm text-text-secondary">
              {state.studyDays.length} dia(s) de estudo por semana
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step 4 — Dates */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-light">
              <Clock className="h-5 w-5 text-accent" />
            </div>
            <CardTitle>Datas do plano</CardTitle>
            <CardDescription>Quando você começa e qual é a sua meta?</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-primary">Data de início</label>
              <input
                type="date"
                value={state.startDate}
                onChange={(e) => setState((s) => ({ ...s, startDate: e.target.value }))}
                className="h-11 rounded-xl border border-border bg-surface px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-primary">
                Data alvo <span className="text-text-muted">(opcional)</span>
              </label>
              <input
                type="date"
                value={state.targetEndDate}
                onChange={(e) => setState((s) => ({ ...s, targetEndDate: e.target.value }))}
                className="h-11 rounded-xl border border-border bg-surface px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="rounded-xl bg-accent-light p-4 text-sm">
              <p className="text-text-secondary">Com {state.newPagesPerDay === 0.5 ? '½' : state.newPagesPerDay} página(s)/dia em {state.studyDays.length} dias/semana, você concluirá os {totalPages} páginas em aproximadamente:</p>
              <p className="mt-1 text-xl font-semibold text-accent">{projection}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5 — Confirm */}
      {step === 5 && (
        <Card>
          <CardHeader>
            <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-light">
              <CheckCircle className="h-5 w-5 text-accent" />
            </div>
            <CardTitle>Tudo pronto!</CardTitle>
            <CardDescription>Seu plano foi configurado. Confirme e comece.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {[
              { label: 'Meta', value: `${state.goal} Juz' (${totalPages} páginas)` },
              { label: 'Ritmo', value: `${state.newPagesPerDay === 0.5 ? '½' : state.newPagesPerDay} página(s)/dia` },
              { label: 'Dias de estudo', value: `${state.studyDays.length} dias por semana` },
              { label: 'Início', value: new Date(state.startDate).toLocaleDateString('pt-BR') },
              { label: 'Conclusão estimada', value: projection },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between rounded-xl bg-surface-alt px-4 py-3">
                <span className="text-sm text-text-secondary">{label}</span>
                <span className="text-sm font-medium text-text-primary">{value}</span>
              </div>
            ))}
            {error && (
              <p className="rounded-xl bg-mastery-1/40 px-3 py-2 text-sm text-red-900">{error}</p>
            )}
            <Button onClick={handleFinish} disabled={loading} size="lg" className="mt-2 w-full">
              {loading ? 'Criando plano...' : 'Começar minha jornada'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 1 && (
          <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="flex-1">
            <ChevronLeft className="h-4 w-4" /> Voltar
          </Button>
        )}
        {step < 5 && (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 3 && state.studyDays.length === 0}
            className="flex-1"
          >
            Continuar <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
