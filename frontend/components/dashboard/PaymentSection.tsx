'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Receipt } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import type { Payment } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

const schema = z.object({
  description: z.string().optional(),
  amount: z.coerce.number().positive('Le montant doit être positif'),
  dueDate: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const STATUS_OPTIONS: Payment['status'][] = ['pending', 'sent', 'overdue', 'paid'];

function formatAmount(amount: string) {
  return `${Number(amount).toFixed(2)}€`;
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function NewPaymentModal({ projectId, open, onClose }: { projectId: string; open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const create = useMutation({
    mutationFn: (values: FormValues) =>
      api.createPayment(projectId, {
        description: values.description || undefined,
        amount: values.amount,
        dueDate: values.dueDate || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', projectId] });
      toast.success('Facture créée');
      reset();
      onClose();
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Échec de la création'),
  });

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle facture">
      <form onSubmit={handleSubmit((v) => create.mutate(v))} className="space-y-4">
        <Input label="Description" placeholder="Acompte 30%" error={errors.description?.message} {...register('description')} />
        <Input label="Montant (€)" type="number" step="0.01" error={errors.amount?.message} {...register('amount')} />
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

export function PaymentSection({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);

  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments', projectId],
    queryFn: () => api.getPayments(projectId),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Payment['status'] }) => api.updatePayment(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments', projectId] }),
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Échec de la mise à jour'),
  });

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt size={15} className="text-indigo" />
          <h3 className="font-display text-sm font-semibold text-ink">Factures</h3>
        </div>
        <Button variant="secondary" onClick={() => setModalOpen(true)}>
          <Plus size={14} />
          Facture
        </Button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !payments || payments.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate">Aucune facture pour le moment.</p>
      ) : (
        <ul className="divide-y divide-line">
          {payments.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="text-sm text-ink">{p.description || 'Facture'}</p>
                <p className="font-mono text-xs text-slate tabular-nums">
                  {formatAmount(p.amount)} {p.dueDate && `· échéance ${formatDate(p.dueDate)}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge status={p.status} />
                <select
                  value={p.status}
                  onChange={(e) => updateStatus.mutate({ id: p.id, status: e.target.value as Payment['status'] })}
                  className="rounded-control border border-line bg-mist px-1.5 py-1 text-xs text-ink"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </li>
          ))}
        </ul>
      )}

      <NewPaymentModal projectId={projectId} open={modalOpen} onClose={() => setModalOpen(false)} />
    </Card>
  );
}
