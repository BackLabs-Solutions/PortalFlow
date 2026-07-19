'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, LayoutGrid, List as ListIcon, User } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import type { Task, TaskStatus } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'todo', label: 'À faire' },
  { status: 'doing', label: 'En cours' },
  { status: 'blocked', label: 'Bloqué' },
  { status: 'done', label: 'Terminé' },
];

const schema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  assignedTo: z.string().email('Email invalide').optional().or(z.literal('')),
  dueDate: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function TaskCard({ task, onStatusChange }: { task: Task; onStatusChange: (status: TaskStatus) => void }) {
  return (
    <div className="rounded-control border border-line bg-surface p-3">
      <p className="text-sm font-medium text-ink">{task.title}</p>
      {task.description && <p className="mt-1 text-xs text-slate">{task.description}</p>}
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-slate">
          {task.assignedTo && (
            <span className="flex items-center gap-1">
              <User size={11} />
              {task.assignedTo}
            </span>
          )}
          {task.dueDate && <span className="font-mono">{formatDate(task.dueDate)}</span>}
        </div>
        <select
          value={task.status}
          onChange={(e) => onStatusChange(e.target.value as TaskStatus)}
          className="rounded-control border border-line bg-mist px-1.5 py-1 text-xs text-ink"
        >
          {COLUMNS.map((c) => (
            <option key={c.status} value={c.status}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function NewTaskModal({ projectId, open, onClose }: { projectId: string; open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const create = useMutation({
    mutationFn: (values: FormValues) =>
      api.createTask(projectId, {
        title: values.title,
        description: values.description || undefined,
        assignedTo: values.assignedTo || undefined,
        dueDate: values.dueDate || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['task-summary', projectId] });
      toast.success('Tâche créée');
      reset();
      onClose();
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Échec de la création'),
  });

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle tâche">
      <form onSubmit={handleSubmit((v) => create.mutate(v))} className="space-y-4">
        <Input label="Titre" placeholder="Livrer les maquettes" error={errors.title?.message} {...register('title')} />
        <Textarea label="Description" rows={2} error={errors.description?.message} {...register('description')} />
        <Input
          label="Assigner au client (email)"
          type="email"
          placeholder="client@exemple.com"
          error={errors.assignedTo?.message}
          {...register('assignedTo')}
        />
        <Input label="Échéance" type="date" error={errors.dueDate?.message} {...register('dueDate')} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" loading={create.isPending}>
            Créer
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function TaskSection({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [modalOpen, setModalOpen] = useState(false);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => api.getTasks(projectId),
  });

  const updateStatus = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) => api.updateTask(taskId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['task-summary', projectId] });
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Échec de la mise à jour'),
  });

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-ink">Tâches</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setView('kanban')}
            aria-label="Vue kanban"
            className={`flex h-7 w-7 items-center justify-center rounded-control ${view === 'kanban' ? 'bg-indigo/10 text-indigo' : 'text-slate'}`}
          >
            <LayoutGrid size={14} />
          </button>
          <button
            onClick={() => setView('list')}
            aria-label="Vue liste"
            className={`flex h-7 w-7 items-center justify-center rounded-control ${view === 'list' ? 'bg-indigo/10 text-indigo' : 'text-slate'}`}
          >
            <ListIcon size={14} />
          </button>
          <Button variant="secondary" onClick={() => setModalOpen(true)} className="ml-2">
            <Plus size={14} />
            Tâche
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !tasks || tasks.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate">Aucune tâche pour le moment.</p>
      ) : view === 'kanban' ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.status} className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-slate">
                {col.label} ({tasks.filter((t) => t.status === col.status).length})
              </p>
              <div className="space-y-2">
                {tasks
                  .filter((t) => t.status === col.status)
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={(status) => updateStatus.mutate({ taskId: task.id, status })}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={(status) => updateStatus.mutate({ taskId: task.id, status })}
            />
          ))}
        </div>
      )}

      <NewTaskModal projectId={projectId} open={modalOpen} onClose={() => setModalOpen(false)} />
    </Card>
  );
}
