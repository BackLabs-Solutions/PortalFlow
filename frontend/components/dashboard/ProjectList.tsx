import Link from 'next/link';
import { ArrowUpRight, User } from 'lucide-react';
import type { Project } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {projects.map((project) => (
        <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
          <Card className="group flex h-full flex-col gap-3 p-5 transition-colors hover:border-indigo/40">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-base font-semibold text-ink">{project.name}</h3>
              <ArrowUpRight
                size={16}
                className="mt-1 shrink-0 text-slate transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-indigo"
              />
            </div>

            {project.clientName && (
              <div className="flex items-center gap-1.5 text-sm text-slate">
                <User size={13} />
                {project.clientName}
              </div>
            )}

            <div className="mt-auto flex items-center justify-between pt-2">
              <Badge status={project.status} />
              <span className="font-mono text-xs text-slate">{formatDate(project.createdAt)}</span>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
