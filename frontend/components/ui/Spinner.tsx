import { Loader2 } from 'lucide-react';

export function Spinner({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate">
      <Loader2 size={22} className="animate-spin text-indigo" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
