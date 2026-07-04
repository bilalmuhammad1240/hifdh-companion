import React from 'react';
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star, RotateCcw, Clock, XCircle, RefreshCw } from 'lucide-react';
import { TeacherRating } from '@/domain/entities/PageMastery';

interface TeacherRatingFormProps {
  planId: string;
  studentName: string;
  sabaqPages: number[];
}

const RATINGS: { value: TeacherRating; label: string; description: string; icon: React.ReactNode; color: string }[] = [
  { value: TeacherRating.EXCELLENT,       label: 'Excelente',       description: 'Recitação perfeita, fluência e Tajweed corretos',        icon: <Star className="h-4 w-4" />,        color: 'border-mastery-5 bg-mastery-5/30 text-green-900' },
  { value: TeacherRating.GOOD,            label: 'Bom',             description: 'Boa recitação com erros mínimos',                        icon: <CheckCircle className="h-4 w-4" />, color: 'border-mastery-4 bg-mastery-4/30 text-green-800' },
  { value: TeacherRating.ACCEPTABLE,      label: 'Aceitável',       description: 'Recitação aceitável, pode avançar com atenção',          icon: <CheckCircle className="h-4 w-4" />, color: 'border-mastery-3 bg-mastery-3/30 text-amber-900' },
  { value: TeacherRating.REPEAT_TOMORROW, label: 'Repetir amanhã', description: 'Precisa repetir a mesma lição amanhã antes de avançar',  icon: <Clock className="h-4 w-4" />,       color: 'border-mastery-2 bg-mastery-2/30 text-orange-900' },
  { value: TeacherRating.REDO,            label: 'Refazer',        description: 'Refazer do início — estudo insuficiente',                icon: <RotateCcw className="h-4 w-4" />,   color: 'border-mastery-1 bg-mastery-1/30 text-red-900' },
  { value: TeacherRating.RESTART,         label: 'Recomeçar',      description: 'Recomeçar esta página completamente do zero',            icon: <RefreshCw className="h-4 w-4" />,   color: 'border-day-missed bg-day-missed/20 text-red-900' },
];

export function TeacherRatingForm({ planId, studentName, sabaqPages }: TeacherRatingFormProps) {
  const [selectedRating, setSelectedRating] = useState<TeacherRating | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (sabaqPages.length === 0) return null;

  async function handleSave() {
    if (!selectedRating) return;
    setSaving(true);
    try {
      // Apply teacher rating to each Sabaq page
      await Promise.all(
        sabaqPages.map((pageNumber) =>
          fetch(`/api/plans/${planId}/pages/${pageNumber}/review`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ errorCount: 0, teacherRating: selectedRating }),
          })
        )
      );
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
          <CheckCircle className="h-10 w-10 text-day-complete" />
          <p className="font-semibold text-text-primary">Avaliação registrada</p>
          <p className="text-sm text-text-secondary">O cronograma de {studentName} foi atualizado automaticamente.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avaliar Sabaq</CardTitle>
        <p className="text-sm text-text-secondary">
          Páginas: <span className="font-mono font-medium text-text-primary">{sabaqPages.join(', ')}</span>
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm font-medium text-text-primary">Avaliação da recitação:</p>

        <div className="flex flex-col gap-2">
          {RATINGS.map((r) => (
            <button
              key={r.value}
              onClick={() => setSelectedRating(r.value)}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                selectedRating === r.value
                  ? r.color
                  : 'border-border bg-surface hover:bg-surface-alt'
              }`}
            >
              <span className="mt-0.5 shrink-0">{r.icon}</span>
              <div>
                <p className="text-sm font-medium">{r.label}</p>
                <p className="text-xs text-text-muted">{r.description}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary">
            Observações <span className="text-text-muted">(opcional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent resize-none"
            placeholder="Ex: Fluência melhorou, mas a ayah 238 precisa de atenção..."
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={!selectedRating || saving}
          className="w-full"
        >
          {saving ? 'Salvando...' : 'Salvar avaliação'}
        </Button>
      </CardContent>
    </Card>
  );
}
