import { FolderKanban, Clock, CheckCircle2 } from 'lucide-react';
import type { Project } from '@/lib/types';
import { Card } from '@/components/ui/Card';

export function StatsRow({ projects }: { projects: Project[] }) {
  const active = projects.filter((p) => p.status === 'active').length;
  const completed = projects.filter((p) => p.status === 'completed').length;

  const stats = [
    { label: 'Projets actifs', value: active, icon: FolderKanban, color: 'text-indigo bg-indigo/10' },
    { label: 'Total projets', value: projects.length, icon: Clock, color: 'text-[#0f7f96] bg-cyan/12' },
    { label: 'Terminés', value: completed, icon: CheckCircle2, color: 'text-slate bg-slate/10' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <Card key={label} className="flex items-center gap-4 p-5">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-control ${color}`}>
            <Icon size={19} />
          </div>
          <div>
            <p className="font-mono text-2xl font-medium text-ink tabular-nums">{value}</p>
            <p className="text-xs text-slate">{label}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
