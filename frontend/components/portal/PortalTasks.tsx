'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import type { Task, TaskStatus } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const STATUS_OPTIONS: TaskStatus[] = ['todo', 'doing', 'blocked', 'done'];
const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'À faire',
  doing: 'En cours',
  blocked: 'Bloqué',
  done: 'Terminé',
};

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export function PortalTasks({ projectId, tasks }: { projectId: string; tasks: Task[] }) {
  const queryClient = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      api.updatePortalTask(projectId, taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', projectId] });
      toast.success('Statut mis à jour');
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Échec de la mise à jour'),
  });

  if (tasks.length === 0) return null;

  return (
    <Card className="space-y-3 p-6">
      <h2 className="font-display text-base font-semibold text-ink">Tâches</h2>
      <ul className="divide-y divide-line">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center justify-between gap-3 py-3">
            <div>
              <p className="text-sm text-ink">{task.title}</p>
              {task.description && <p className="text-xs text-slate">{task.description}</p>}
              {task.dueDate && <p className="mt-0.5 text-xs text-slate">Échéance : {formatDate(task.dueDate)}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge status={task.status} />
              <select
                value={task.status}
                onChange={(e) => updateStatus.mutate({ taskId: task.id, status: e.target.value as TaskStatus })}
                className="rounded-control border border-line bg-mist px-1.5 py-1 text-xs text-ink"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
