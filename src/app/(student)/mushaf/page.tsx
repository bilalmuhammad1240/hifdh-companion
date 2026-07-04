'use client';

import { useState, useEffect } from 'react';
import { PageStatusBadge } from '@/components/shared/PageStatusBadge';

interface JuzSummary {
  juz: number;
  totalPages: number;
  memorizedPages: number;
  averageMastery: number;
  pageStatuses: Array<{ pageNumber: number; masteryLevel: number; status: string }>;
}

const PLAN_ID = 'demo';

const MASTERY_BG: Record<number, string> = {
  0: 'bg-mastery-0',
  1: 'bg-mastery-1',
  2: 'bg-mastery-2',
  3: 'bg-mastery-3',
  4: 'bg-mastery-4',
  5: 'bg-mastery-5',
};

export default function MushafahPage() {
  const [juzData, setJuzData] = useState<JuzSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedJuz, setExpandedJuz] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/stats/mushaf?planId=${PLAN_ID}`);
        if (res.ok) {
          const data = await res.json();
          setJuzData(data.juz ?? []);
        }
      } catch {
        // Demo: empty data
        setJuzData(Array.from({ length: 30 }, (_, i) => ({
          juz: i + 1,
          totalPages: 20,
          memorizedPages: 0,
          averageMastery: 0,
          pageStatuses: [],
        })));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-3 animate-pulse">
        <div className="h-8 w-32 rounded-xl bg-surface-alt" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-surface-alt" />
        ))}
      </div>
    );
  }

  const totalMemorized = juzData.reduce((s, j) => s + j.memorizedPages, 0);
  const totalPages = juzData.reduce((s, j) => s + j.totalPages, 0);
  const percent = totalPages > 0 ? Math.round((totalMemorized / totalPages) * 100) : 0;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Meu Mushaf</h1>
        <p className="mt-1 text-sm text-text-secondary">{totalMemorized} de {totalPages} páginas memorizadas · {percent}%</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {[
          { level: 0, label: 'Não memorizada' },
          { level: 1, label: 'Nova' },
          { level: 2, label: 'Fraca' },
          { level: 3, label: 'Regular' },
          { level: 4, label: 'Boa' },
          { level: 5, label: 'Excelente' },
        ].map(({ level, label }) => (
          <div key={level} className="flex items-center gap-1.5">
            <span className={`h-3 w-3 rounded-sm ${MASTERY_BG[level]}`} />
            <span className="text-xs text-text-muted">{label}</span>
          </div>
        ))}
      </div>

      {/* Juz list */}
      <div className="flex flex-col gap-2">
        {juzData.map((juz) => {
          const juzPercent = juz.totalPages > 0 ? (juz.memorizedPages / juz.totalPages) * 100 : 0;
          const isExpanded = expandedJuz === juz.juz;

          return (
            <div key={juz.juz} className="rounded-2xl border border-border bg-surface overflow-hidden">
              <button
                className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-surface-alt"
                onClick={() => setExpandedJuz(isExpanded ? null : juz.juz)}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-alt">
                  <span className="font-mono text-sm font-bold text-text-secondary">{juz.juz}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-text-primary">Juz' {juz.juz}</span>
                    <span className="text-xs font-mono text-text-muted">{Math.round(juzPercent)}%</span>
                  </div>
                  {/* Mini pixel bar of pages */}
                  <div className="flex gap-px">
                    {Array.from({ length: juz.totalPages }, (_, i) => {
                      const pg = juz.pageStatuses[i];
                      const mastery = pg?.masteryLevel ?? 0;
                      return (
                        <div
                          key={i}
                          className={`h-2 flex-1 rounded-sm ${MASTERY_BG[mastery] ?? MASTERY_BG[0]}`}
                        />
                      );
                    })}
                  </div>
                </div>
              </button>

              {/* Expanded: page grid */}
              {isExpanded && juz.pageStatuses.length > 0 && (
                <div className="border-t border-border px-4 py-3">
                  <p className="text-xs font-semibold text-text-muted mb-2">Páginas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {juz.pageStatuses.map((pg) => (
                      <div
                        key={pg.pageNumber}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-mono font-medium ${MASTERY_BG[pg.masteryLevel] ?? MASTERY_BG[0]}`}
                        title={`Página ${pg.pageNumber}`}
                      >
                        {pg.pageNumber}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {isExpanded && juz.pageStatuses.length === 0 && (
                <div className="border-t border-border px-4 py-3">
                  <p className="text-xs text-text-muted">Nenhuma página memorizada neste Juz'.</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
