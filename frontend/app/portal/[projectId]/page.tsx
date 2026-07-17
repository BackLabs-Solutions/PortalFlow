'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { File, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Logo } from '@/components/ui/Logo';
import { PortalChecklist } from '@/components/portal/PortalChecklist';
import { PortalMessages } from '@/components/portal/PortalMessages';

function formatSize(bytes: number | null) {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function ClientPortalPage() {
  const params = useParams<{ projectId: string }>();

  const { data: portal, isLoading, isError } = useQuery({
    queryKey: ['portal', params.projectId],
    queryFn: () => api.getPortal(params.projectId),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mist">
        <Spinner />
      </div>
    );
  }

  if (isError || !portal) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-mist px-4 text-center">
        <AlertCircle size={28} className="text-danger" />
        <div>
          <p className="font-display text-lg font-semibold text-ink">Projet introuvable</p>
          <p className="mt-1 text-sm text-slate">Ce lien n&apos;est plus valide ou a été révoqué.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mist">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <Logo size={26} withWordmark={!portal.freelancer.logoUrl} />
          {portal.freelancer.name && (
            <span className="text-sm text-slate">Espace de {portal.freelancer.name}</span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h1 className="font-display text-2xl font-semibold text-ink">{portal.name}</h1>
            <Badge status={portal.status} />
          </div>
          {portal.description && <p className="text-sm text-slate">{portal.description}</p>}
        </div>

        {portal.files.length > 0 && (
          <Card className="space-y-3 p-6">
            <h2 className="font-display text-base font-semibold text-ink">Fichiers</h2>
            <ul className="divide-y divide-line">
              {portal.files.map((file) => (
                <li key={file.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <File size={15} className="text-slate" />
                    <span className="text-sm text-ink">{file.name}</span>
                  </div>
                  <span className="font-mono text-xs text-slate tabular-nums">{formatSize(file.size)}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <PortalChecklist
          projectId={portal.id}
          items={portal.checklistItems}
          defaultName={portal.clientName || ''}
        />

        <PortalMessages
          projectId={portal.id}
          messages={portal.messages}
          defaultEmail={portal.clientEmail || ''}
        />
      </main>

      <footer className="border-t border-line py-6 text-center text-xs text-slate">
        Propulsé par PortalFlow
      </footer>
    </div>
  );
}
