interface StatRowProps {
  label: string;
  value: string;
}

export function StatRow({ label, value }: StatRowProps) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-surface p-4 text-center">
      <span className="font-mono text-2xl font-semibold text-text-primary">{value}</span>
      <span className="text-xs text-text-muted">{label}</span>
    </div>
  );
}
