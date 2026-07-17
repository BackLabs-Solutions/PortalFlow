'use client';

import { useState } from 'react';
import { Link2, Check, Copy } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function ShareLinkCard({ projectId }: { projectId: string }) {
  const [copied, setCopied] = useState(false);

  const portalUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/portal/${projectId}` : '';

  const copy = async () => {
    await navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-center gap-2 text-sm font-medium text-ink">
        <Link2 size={15} className="text-indigo" />
        Lien de partage client
      </div>
      <p className="text-xs text-slate">
        Ce lien donne accès au portail du projet sans connexion — envoyez-le à votre client.
      </p>
      <div className="flex items-center gap-2">
        <code className="flex-1 truncate rounded-control border border-line bg-mist px-3 py-2 font-mono text-xs text-slate">
          {portalUrl}
        </code>
        <button
          onClick={copy}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control border border-line text-slate transition-colors hover:text-indigo"
          aria-label="Copier le lien"
        >
          {copied ? <Check size={15} className="text-[#0f7f96]" /> : <Copy size={15} />}
        </button>
      </div>
    </Card>
  );
}
