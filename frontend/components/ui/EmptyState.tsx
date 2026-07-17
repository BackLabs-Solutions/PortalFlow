import { LucideIcon } from 'lucide-react';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-line py-16 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-mist text-slate">
        <Icon size={20} />
      </div>
      <div className="space-y-1">
        <p className="font-display text-base font-semibold text-ink">{title}</p>
        {description && <p className="max-w-xs text-sm text-slate">{description}</p>}
      </div>
      {action}
    </div>
  );
}
