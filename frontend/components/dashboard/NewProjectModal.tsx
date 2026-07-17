'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const schema = z.object({
  name: z.string().min(1, 'Le nom du projet est requis'),
  clientName: z.string().optional(),
  clientEmail: z.string().email('Email invalide').optional().or(z.literal('')),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function NewProjectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      api.createProject({
        name: values.name,
        clientName: values.clientName || undefined,
        clientEmail: values.clientEmail || undefined,
        description: values.description || undefined,
      }),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projet créé');
      reset();
      onClose();
      router.push(`/dashboard/projects/${project.id}`);
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Impossible de créer le projet');
    },
  });

  return (
    <Modal open={open} onClose={onClose} title="Nouveau projet">
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
        <Input
          label="Nom du projet"
          placeholder="Refonte site web — Acme Corp"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Nom du client"
          placeholder="Marie Dupont"
          error={errors.clientName?.message}
          {...register('clientName')}
        />
        <Input
          label="Email du client"
          type="email"
          placeholder="marie@acme.com"
          error={errors.clientEmail?.message}
          {...register('clientEmail')}
        />
        <Textarea
          label="Description"
          rows={3}
          placeholder="Détails du projet…"
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Créer le projet
          </Button>
        </div>
      </form>
    </Modal>
  );
}
