'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Trash2, User, Mail } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ShareLinkCard } from '@/components/dashboard/ShareLinkCard';
import { FileSection } from '@/components/dashboard/FileSection';
import { ChecklistSection } from '@/components/dashboard/ChecklistSection';
import { MessageSection } from '@/components/dashboard/MessageSection';

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', params.id],
    queryFn: () => api.getProject(params.id),
  });

  const remove = useMutation({
    mutationFn: () => api.deleteProject(params.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projet supprimé');
      router.push('/dashboard');
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Échec de la suppression'),
  });

  if (isLoading) return <Spinner />;
  if (!project) return <p className="text-sm text-slate">Projet introuvable.</p>;

  return (
    <div className="space-y-8">
      <button
        onClick={() => router.push('/dashboard')}
        className="flex items-center gap-1.5 text-sm text-slate hover:text-ink"
      >
        <ArrowLeft size={14} />
        Tous les projets
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h1 className="font-display text-2xl font-semibold text-ink">{project.name}</h1>
            <Badge status={project.status} />
          </div>
          {project.description && <p className="max-w-xl text-sm text-slate">{project.description}</p>}
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate">
            {project.clientName && (
              <span className="flex items-center gap-1.5">
                <User size={13} />
                {project.clientName}
              </span>
            )}
            {project.clientEmail && (
              <span className="flex items-center gap-1.5">
                <Mail size={13} />
                {project.clientEmail}
              </span>
            )}
          </div>
        </div>

        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate">Supprimer définitivement ?</span>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              Annuler
            </Button>
            <Button variant="danger" loading={remove.isPending} onClick={() => remove.mutate()}>
              Confirmer
            </Button>
          </div>
        ) : (
          <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
            <Trash2 size={15} />
            Supprimer
          </Button>
        )}
      </div>

      <ShareLinkCard projectId={project.id} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FileSection projectId={project.id} />
        <ChecklistSection projectId={project.id} />
        <div className="lg:col-span-2">
          <MessageSection projectId={project.id} />
        </div>
      </div>
    </div>
  );
}
