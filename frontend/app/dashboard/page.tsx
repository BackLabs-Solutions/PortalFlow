'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, FolderPlus } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { ProjectList } from '@/components/dashboard/ProjectList';
import { NewProjectModal } from '@/components/dashboard/NewProjectModal';

export default function DashboardPage() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.getProjects(),
  });

  const filtered = useMemo(() => {
    if (!projects) return [];
    const q = search.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) => p.name.toLowerCase().includes(q) || p.clientName?.toLowerCase().includes(q)
    );
  }, [projects, search]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Projets</h1>
          <p className="mt-1 text-sm text-slate">Tous vos projets clients, au même endroit.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          Nouveau projet
        </Button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : projects && projects.length > 0 ? (
        <>
          <StatsRow projects={projects} />

          <div className="relative max-w-sm">
            <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate" />
            <Input
              placeholder="Rechercher un projet ou un client…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {filtered.length > 0 ? (
            <ProjectList projects={filtered} />
          ) : (
            <EmptyState icon={Search} title="Aucun résultat" description="Essayez un autre terme de recherche." />
          )}
        </>
      ) : (
        <EmptyState
          icon={FolderPlus}
          title="Aucun projet pour le moment"
          description="Créez votre premier projet pour commencer à collaborer avec vos clients."
          action={
            <Button onClick={() => setModalOpen(true)}>
              <Plus size={16} />
              Créer un projet
            </Button>
          }
        />
      )}

      <NewProjectModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
