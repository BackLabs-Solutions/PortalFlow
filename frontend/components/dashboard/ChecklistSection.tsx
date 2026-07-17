'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, CheckCircle2, Circle, XCircle } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const statusIcon = {
  approved: <CheckCircle2 size={17} className="text-[#0f7f96]" />,
  rejected: <XCircle size={17} className="text-danger" />,
  pending: <Circle size={17} className="text-slate/50" />,
};

export function ChecklistSection({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = useState('');

  const { data: items, isLoading } = useQuery({
    queryKey: ['checklist', projectId],
    queryFn: () => api.getChecklist(projectId),
  });

  const create = useMutation({
    mutationFn: (title: string) => api.createChecklistItem(projectId, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist', projectId] });
      setNewTitle('');
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Échec de l'ajout"),
  });

  const approved = items?.filter((i) => i.status === 'approved').length ?? 0;
  const total = items?.length ?? 0;

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-ink">Checklist</h3>
        {total > 0 && (
          <span className="font-mono text-xs text-slate tabular-nums">
            {approved}/{total} approuvés
          </span>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (newTitle.trim()) create.mutate(newTitle.trim());
        }}
        className="mb-4 flex gap-2"
      >
        <Input
          placeholder="Nouvel item de checklist…"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="secondary" loading={create.isPending}>
          <Plus size={15} />
        </Button>
      </form>

      {isLoading ? (
        <Spinner />
      ) : items && items.length > 0 ? (
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 rounded-control px-2 py-2.5 hover:bg-mist">
              {statusIcon[item.status]}
              <span className={`flex-1 text-sm ${item.status === 'approved' ? 'text-slate line-through' : 'text-ink'}`}>
                {item.title}
              </span>
              {item.status === 'approved' && item.approvedBy && (
                <span className="text-xs text-slate">par {item.approvedBy}</span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-4 text-center text-sm text-slate">Aucun item pour le moment.</p>
      )}
    </Card>
  );
}
