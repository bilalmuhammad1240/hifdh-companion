'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DayStatus {
  date: string;
  status: 'complete' | 'partial' | 'missed' | 'rest' | 'future';
}

interface HifdhCalendarProps {
  planId: string;
}

const STATUS_COLORS: Record<DayStatus['status'], string> = {
  complete: 'bg-day-complete',
  partial:  'bg-day-partial',
  missed:   'bg-day-missed',
  rest:     'bg-day-rest',
  future:   'bg-border',
};

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function HifdhCalendar({ planId }: HifdhCalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [days, setDays] = useState<DayStatus[]>([]);

  useEffect(() => {
    // Fetch calendar data from API
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/stats/calendar?planId=${planId}&year=${year}&month=${month + 1}`);
        if (res.ok) {
          const data = await res.json();
          setDays(data.days ?? []);
        }
      } catch {
        setDays([]);
      }
    };
    void fetchData();
  }, [planId, year, month]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = new Date(year, month).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  function getStatus(day: number): DayStatus['status'] {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const found = days.find((d) => d.date === dateStr);
    if (found) return found.status;
    const d = new Date(year, month, day);
    return d > today ? 'future' : 'missed';
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      {/* Month nav */}
      <div className="mb-4 flex items-center justify-between">
        <button onClick={prevMonth} className="rounded-lg p-1.5 hover:bg-surface-alt" aria-label="Mês anterior">
          <ChevronLeft className="h-4 w-4 text-text-secondary" />
        </button>
        <span className="text-sm font-medium capitalize text-text-primary">{monthName}</span>
        <button onClick={nextMonth} className="rounded-lg p-1.5 hover:bg-surface-alt" aria-label="Próximo mês">
          <ChevronRight className="h-4 w-4 text-text-secondary" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="mb-2 grid grid-cols-7 text-center">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="text-xs font-medium text-text-muted">{d}</span>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-1.5 text-center">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const status = getStatus(day);
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          return (
            <div key={day} className="flex flex-col items-center gap-1">
              <span className={`text-xs ${isToday ? 'font-bold text-accent' : 'text-text-secondary'}`}>
                {day}
              </span>
              <span className={`h-2 w-2 rounded-full ${STATUS_COLORS[status]}`} />
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3">
        {[
          { label: 'Completo', color: 'bg-day-complete' },
          { label: 'Parcial',  color: 'bg-day-partial' },
          { label: 'Faltou',   color: 'bg-day-missed' },
          { label: 'Descanso', color: 'bg-day-rest' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${color}`} />
            <span className="text-xs text-text-muted">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
