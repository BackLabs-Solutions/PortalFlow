'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X, Circle } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import type { ChecklistItem } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function PortalChecklist({
  projectId,
  items,
  defaultName,
}: {
  projectId: string;
  items: ChecklistItem[];
  defaultName: string;
}) {
  const queryClient = useQueryClient();
  const [approverName, setApproverName] = useState(defaultName);
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const decide = useMutation({
    mutationFn: ({ itemId, status }: { itemId: string; status: 'approved' | 'rejected' }) =>
      api.approvePortalItem(projectId, itemId, { status, approvedBy: approverName || 'Client' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', projectId] });
      toast.success('Statut mis à jour');
      setActiveItem(null);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Échec de la mise à jour'),
  });

  const pending = items.filter((i) => i.status === 'pending');
  const decided = items.filter((i) => i.status !== 'pending');

  if (items.length === 0) return null;

  return (
    <Card className="space-y-4 p-6">
      <h2 className="font-display text-base font-semibold text-ink">Éléments à valider</h2>

      {pending.length > 0 && (
        <div className="rounded-control border border-line bg-mist p-3">
          <Input
            label="Votre nom (pour l'approbation)"
            value={approverName}
            onChange={(e) => setApproverName(e.target.value)}
            placeholder="Votre nom"
          />
        </div>
      )}

      <ul className="divide-y divide-line">
        {[...pending, ...decided].map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-2.5">
              {item.status === 'approved' ? (
                <Check size={17} className="text-[#0f7f96]" />
              ) : item.status === 'rejected' ? (
                <X size={17} className="text-danger" />
              ) : (
                <Circle size={17} className="text-slate/50" />
              )}
              <div>
                <p className="text-sm text-ink">{item.title}</p>
                {item.description && <p className="text-xs text-slate">{item.description}</p>}
                {item.approvedBy && (
                  <p className="mt-0.5 text-xs text-slate">
                    {item.status === 'approved' ? 'Approuvé' : 'Refusé'} par {item.approvedBy}
                  </p>
                )}
              </div>
            </div>

            {item.status === 'pending' && (
              <div className="flex shrink-0 gap-2">
                <Button
                  variant="secondary"
                  loading={decide.isPending && activeItem === item.id}
                  onClick={() => {
                    setActiveItem(item.id);
                    decide.mutate({ itemId: item.id, status: 'rejected' });
                  }}
                >
                  Refuser
                </Button>
                <Button
                  loading={decide.isPending && activeItem === item.id}
                  onClick={() => {
                    setActiveItem(item.id);
                    decide.mutate({ itemId: item.id, status: 'approved' });
                  }}
                >
                  Approuver
                </Button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
