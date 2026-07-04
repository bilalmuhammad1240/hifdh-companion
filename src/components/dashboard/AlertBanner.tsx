import { AlertTriangle } from 'lucide-react';

export function AlertBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-mastery-2 bg-mastery-2/30 p-3">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-700" aria-hidden="true" />
      <p className="text-sm text-orange-900">{message}</p>
    </div>
  );
}
