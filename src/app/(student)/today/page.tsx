import React from 'react';
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, ChevronRight, Timer, BookOpen, RotateCcw, Library, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';

type Phase = 'overview' | 'sabqi' | 'manzil' | 'sabaq' | 'summary';

interface PageReview {
  pageNumber: number;
  errorCount: number;
  done: boolean;
}

interface DailyPlanData {
  sabaq: { pages: number[]; isBlocked: boolean; blockReason: string | null; estimatedMinutes: number };
  sabqi: { pages: number[]; estimatedMinutes: number };
  manzil: { pages: number[]; juzBeingReviewed: number | null; estimatedMinutes: number };
  explanation: string;
  isRestDay: boolean;
  totalEstimatedMinutes: number;
  warnings: string[];
}

const PLAN_ID = 'demo';

export default function TodayPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('overview');
  const [plan, setPlan] = useState<DailyPlanData | null>(null);
  const [loading, setLoading] = useState(true);

  // Review state
  const [sabqiReviews, setSabqiReviews]   = useState<PageReview[]>([]);
  const [manzilReviews, setManzilReviews] = useState<PageReview[]>([]);
  const [sabaqDone, setSabaqDone]         = useState(false);
  const [sabaqDifficulty, setSabaqDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');

  const [currentIdx, setCurrentIdx] = useState(0);
  const [sessionStart] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - sessionStart) / 1000)), 1000);
    return () => clearInterval(interval);
  }, [sessionStart]);

  // Load plan
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/plans/${PLAN_ID}/daily/today`);
        if (res.ok) {
          const data: DailyPlanData = await res.json();
          setPlan(data);
          setSabqiReviews(data.sabqi.pages.map((p) => ({ pageNumber: p, errorCount: 0, done: false })));
          setManzilReviews(data.manzil.pages.map((p) => ({ pageNumber: p, errorCount: 0, done: false })));
        }
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const submitReview = useCallback(async (pageNumber: number, errorCount: number, reviewType: 'sabqi' | 'manzil') => {
    await fetch(`/api/plans/${PLAN_ID}/pages/${pageNumber}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ errorCount, recitationSeconds: 90 }),
    });
    if (reviewType === 'sabqi') {
      setSabqiReviews((prev) => prev.map((r) => r.pageNumber === pageNumber ? { ...r, errorCount, done: true } : r));
    } else {
      setManzilReviews((prev) => prev.map((r) => r.pageNumber === pageNumber ? { ...r, errorCount, done: true } : r));
    }
  }, []);

  const submitMemorize = useCallback(async (pageNumber: number) => {
    await fetch(`/api/plans/${PLAN_ID}/pages/${pageNumber}/memorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ difficulty: sabaqDifficulty }),
    });
    setSabaqDone(true);
  }, [sabaqDifficulty]);

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  if (loading) return <PageSkeleton />;
  if (!plan) return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <p className="text-text-secondary">Nenhum plano encontrado.</p>
      <Button onClick={() => router.push('/onboarding')}>Criar plano</Button>
    </div>
  );

  if (plan.isRestDay) return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="text-5xl">🌙</div>
      <h1 className="text-xl font-semibold text-text-primary">Dia de descanso</h1>
      <p className="text-sm text-text-secondary">{plan.explanation}</p>
    </div>
  );

  // ── OVERVIEW ──────────────────────────────────────────────
  if (phase === 'overview') {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Plano de hoje</h1>
          <p className="mt-1 text-sm text-text-secondary">{plan.explanation}</p>
        </div>

        <div className="flex flex-col gap-2.5">
          <PhaseCard icon={<RotateCcw className="h-4 w-4" />} title="Sabqi — Revisão recente" count={plan.sabqi.pages.length} minutes={plan.sabqi.estimatedMinutes} order={1} />
          <PhaseCard icon={<Library className="h-4 w-4" />} title={plan.manzil.juzBeingReviewed ? `Manzil — Juz' ${plan.manzil.juzBeingReviewed}` : 'Manzil — Revisão antiga'} count={plan.manzil.pages.length} minutes={plan.manzil.estimatedMinutes} order={2} />
          <PhaseCard icon={<BookOpen className="h-4 w-4" />} title="Sabaq — Nova memorização" count={plan.sabaq.isBlocked ? 0 : plan.sabaq.pages.length} minutes={plan.sabaq.estimatedMinutes} order={3} blocked={plan.sabaq.isBlocked} />
        </div>

        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Timer className="h-4 w-4" />
          <span>Aprox. {plan.totalEstimatedMinutes} minutos</span>
        </div>

        <Button size="lg" className="w-full" onClick={() => {
          if (plan.sabqi.pages.length > 0) { setPhase('sabqi'); setCurrentIdx(0); }
          else if (plan.manzil.pages.length > 0) { setPhase('manzil'); setCurrentIdx(0); }
          else { setPhase('sabaq'); }
        }}>
          Começar sessão
        </Button>
      </div>
    );
  }

  // ── SABQI ──────────────────────────────────────────────────
  if (phase === 'sabqi') {
    const pages = sabqiReviews;
    const current = pages[currentIdx];
    const allDone = pages.every((p) => p.done);
    const progress = (pages.filter((p) => p.done).length / Math.max(1, pages.length)) * 100;

    return (
      <div className="flex flex-col gap-5">
        <SessionHeader title="Sabqi — Revisão Recente" phase={1} totalPhases={3} progress={progress} elapsed={formatTime(elapsed)} />
        {current && !current.done ? (
          <ReviewCard
            pageNumber={current.pageNumber}
            onSubmit={(errors) => {
              void submitReview(current.pageNumber, errors, 'sabqi');
              if (currentIdx + 1 < pages.length) setCurrentIdx((i) => i + 1);
            }}
          />
        ) : (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle className="h-12 w-12 text-day-complete" />
            <p className="font-semibold text-text-primary">Sabqi concluído!</p>
            <p className="text-sm text-text-secondary">{pages.filter((p) => p.done).length} de {pages.length} páginas revisadas</p>
            <Button className="mt-2 w-full" onClick={() => { setPhase(plan.manzil.pages.length > 0 ? 'manzil' : 'sabaq'); setCurrentIdx(0); }}>
              Continuar → Manzil <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
        {!allDone && (
          <div className="flex gap-2 flex-wrap">
            {pages.map((p, i) => (
              <button key={p.pageNumber} onClick={() => setCurrentIdx(i)}
                className={`h-8 w-8 rounded-lg text-xs font-mono font-medium transition-colors ${p.done ? 'bg-day-complete text-white' : i === currentIdx ? 'bg-accent text-white' : 'bg-surface-alt text-text-secondary'}`}>
                {p.pageNumber}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── MANZIL ─────────────────────────────────────────────────
  if (phase === 'manzil') {
    const pages = manzilReviews;
    const current = pages[currentIdx];
    const allDone = pages.every((p) => p.done);
    const progress = (pages.filter((p) => p.done).length / Math.max(1, pages.length)) * 100;

    return (
      <div className="flex flex-col gap-5">
        <SessionHeader title={`Manzil${plan.manzil.juzBeingReviewed ? ` — Juz' ${plan.manzil.juzBeingReviewed}` : ''}`} phase={2} totalPhases={3} progress={progress} elapsed={formatTime(elapsed)} />
        {current && !current.done ? (
          <ReviewCard
            pageNumber={current.pageNumber}
            onSubmit={(errors) => {
              void submitReview(current.pageNumber, errors, 'manzil');
              if (currentIdx + 1 < pages.length) setCurrentIdx((i) => i + 1);
            }}
          />
        ) : (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle className="h-12 w-12 text-day-complete" />
            <p className="font-semibold text-text-primary">Manzil concluído!</p>
            <Button className="mt-2 w-full" onClick={() => setPhase('sabaq')}>
              Continuar → Sabaq <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
        {!allDone && pages.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {pages.map((p, i) => (
              <button key={p.pageNumber} onClick={() => setCurrentIdx(i)}
                className={`h-8 w-8 rounded-lg text-xs font-mono font-medium transition-colors ${p.done ? 'bg-day-complete text-white' : i === currentIdx ? 'bg-accent text-white' : 'bg-surface-alt text-text-secondary'}`}>
                {p.pageNumber}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── SABAQ ──────────────────────────────────────────────────
  if (phase === 'sabaq') {
    if (plan.sabaq.isBlocked) {
      return (
        <div className="flex flex-col gap-5">
          <SessionHeader title="Sabaq — Nova Memorização" phase={3} totalPhases={3} progress={100} elapsed={formatTime(elapsed)} />
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mastery-2/30 text-2xl">⏸️</div>
              <p className="font-medium text-text-primary">Sabaq pausado hoje</p>
              <p className="text-sm text-text-secondary">{plan.sabaq.blockReason}</p>
            </CardContent>
          </Card>
          <Button className="w-full" onClick={() => setPhase('summary')}>Ver resumo</Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-5">
        <SessionHeader title="Sabaq — Nova Memorização" phase={3} totalPhases={3} progress={sabaqDone ? 100 : 0} elapsed={formatTime(elapsed)} />
        {!sabaqDone ? (
          <Card>
            <CardContent className="flex flex-col gap-5 pt-5">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">Memorizar hoje</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {plan.sabaq.pages.map((p) => (
                    <span key={p} className="rounded-xl bg-accent-light px-3 py-1.5 font-mono text-sm font-semibold text-accent">
                      Página {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-surface-alt p-3 text-sm text-text-secondary">
                <p className="font-medium text-text-primary mb-1">Como fazer:</p>
                <ol className="space-y-0.5 text-xs list-decimal list-inside">
                  <li>Leia a página devagar, prestando atenção ao Tajweed</li>
                  <li>Repita linha por linha até fixar</li>
                  <li>Recite a página completa sem olhar</li>
                  <li>Repita 3× até sentir-se seguro</li>
                </ol>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-text-primary">Como foi?</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['easy', 'normal', 'hard'] as const).map((d) => (
                    <button key={d} onClick={() => setSabaqDifficulty(d)}
                      className={`rounded-xl border py-2.5 text-xs font-medium transition-colors ${sabaqDifficulty === d ? 'border-accent bg-accent text-white' : 'border-border text-text-secondary hover:bg-surface-alt'}`}>
                      {d === 'easy' ? 'Fácil' : d === 'normal' ? 'Normal' : 'Difícil'}
                    </button>
                  ))}
                </div>
              </div>

              <Button size="lg" className="w-full" onClick={() => void submitMemorize(plan.sabaq.pages[0]!)}>
                Marcar como memorizada ✓
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle className="h-16 w-16 text-day-complete" />
            <p className="text-xl font-semibold text-text-primary">Sabaq concluído!</p>
            <p className="text-sm text-text-secondary">Página {plan.sabaq.pages[0]} memorizada hoje.</p>
            <Button className="mt-2 w-full" onClick={() => setPhase('summary')}>Ver resumo</Button>
          </div>
        )}
      </div>
    );
  }

  // ── SUMMARY ────────────────────────────────────────────────
  const totalErrors = [...sabqiReviews, ...manzilReviews].reduce((s, r) => s + r.errorCount, 0);
  const totalReviewed = sabqiReviews.length + manzilReviews.length;
  const accuracy = totalReviewed > 0 ? Math.max(0, Math.round(100 - (totalErrors / totalReviewed) * 20)) : 100;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <Star className="h-14 w-14 text-gold" />
        <h1 className="text-2xl font-semibold text-text-primary">Sessão concluída!</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Páginas revisadas', value: String(totalReviewed) },
          { label: 'Precisão', value: `${accuracy}%` },
          { label: 'Tempo', value: formatTime(elapsed) },
          { label: 'Erros', value: String(totalErrors) },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center gap-1 rounded-2xl bg-surface p-4 border border-border text-center">
            <span className="font-mono text-2xl font-semibold text-text-primary">{value}</span>
            <span className="text-xs text-text-muted">{label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Button className="w-full" onClick={() => router.push('/dashboard')}>Voltar ao início</Button>
        <Button variant="outline" className="w-full" onClick={() => router.push('/mushaf')}>Ver meu Mushaf</Button>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────

function SessionHeader({ title, phase, totalPhases, progress, elapsed }: {
  title: string; phase: number; totalPhases: number; progress: number; elapsed: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-text-muted">Fase {phase} de {totalPhases}</p>
          <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-surface-alt px-3 py-1.5 text-xs font-mono text-text-secondary">
          <Timer className="h-3.5 w-3.5" />
          {elapsed}
        </div>
      </div>
      <ProgressBar value={progress} />
    </div>
  );
}

function ReviewCard({ pageNumber, onSubmit }: { pageNumber: number; onSubmit: (errors: number) => void }) {
  const [errors, setErrors] = useState(0);

  return (
    <Card>
      <CardContent className="flex flex-col gap-5 pt-5">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">Recitar de memória</p>
          <p className="mt-1 font-mono text-4xl font-bold text-text-primary">{pageNumber}</p>
          <p className="text-sm text-text-secondary">Página {pageNumber}</p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-text-primary">Quantos erros?</p>
          <div className="grid grid-cols-5 gap-2">
            {[0, 1, 2, 3, 4].map((n) => (
              <button key={n} onClick={() => setErrors(n)}
                className={`rounded-xl border py-2.5 text-sm font-medium transition-colors ${errors === n ? n === 0 ? 'border-day-complete bg-day-complete text-white' : n <= 2 ? 'border-day-partial bg-day-partial text-white' : 'border-day-missed bg-day-missed text-white' : 'border-border bg-surface text-text-secondary hover:bg-surface-alt'}`}>
                {n === 4 ? '4+' : n}
              </button>
            ))}
          </div>
        </div>

        <Button className="w-full" onClick={() => onSubmit(errors)}>
          {errors === 0 ? <><CheckCircle className="h-4 w-4" /> Perfeito</> : <><XCircle className="h-4 w-4" /> Registrar {errors} erro(s)</>}
        </Button>
      </CardContent>
    </Card>
  );
}

function PhaseCard({ icon, title, count, minutes, order, blocked }: {
  icon: React.ReactNode; title: string; count: number; minutes: number; order: number; blocked?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border p-4 ${blocked ? 'border-border bg-surface-alt opacity-60' : 'border-border bg-surface'}`}>
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${blocked ? 'bg-surface-alt text-text-muted' : 'bg-accent-light text-accent'}`}>
        {order}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{title}</p>
        <p className="text-xs text-text-muted">{blocked ? 'Pausado' : `${count} página(s) · ~${minutes} min`}</p>
      </div>
      {icon && <span className="text-text-muted">{icon}</span>}
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-5 animate-pulse">
      <div className="h-8 w-48 rounded-xl bg-surface-alt" />
      <div className="h-4 w-full rounded-xl bg-surface-alt" />
      <div className="h-28 rounded-2xl bg-surface-alt" />
      <div className="h-28 rounded-2xl bg-surface-alt" />
      <div className="h-28 rounded-2xl bg-surface-alt" />
    </div>
  );
}
