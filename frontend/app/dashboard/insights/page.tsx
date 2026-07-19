'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { BarList } from '@/components/dashboard/charts/BarList';
import { Donut } from '@/components/dashboard/charts/Donut';

export default function InsightsPage() {
  const { data: completion, isLoading: loadingCompletion } = useQuery({
    queryKey: ['report-task-completion'],
    queryFn: () => api.getTaskCompletionReport(),
  });

  const { data: responseTime, isLoading: loadingResponseTime } = useQuery({
    queryKey: ['report-client-response-time'],
    queryFn: () => api.getClientResponseTimeReport(),
  });

  const { data: invoices, isLoading: loadingInvoices } = useQuery({
    queryKey: ['report-invoice-status'],
    queryFn: () => api.getInvoiceStatusReport(),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Insights</h1>
        <p className="mt-1 text-sm text-slate">Vue d&apos;ensemble de vos projets et de votre activité.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 font-display text-sm font-semibold text-ink">Taux de complétion des tâches</h2>
          {loadingCompletion ? (
            <Spinner />
          ) : (
            <BarList
              data={(completion || []).map((r) => ({ label: r.project_name, value: r.completion_rate * 100 }))}
              valueFormatter={(v) => `${Math.round(v)}%`}
              color="var(--cyan)"
              emptyLabel="Aucun projet avec des tâches pour le moment."
            />
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 font-display text-sm font-semibold text-ink">Temps de réponse client moyen</h2>
          {loadingResponseTime ? (
            <Spinner />
          ) : (
            <BarList
              data={(responseTime || []).map((r) => ({ label: r.project_name, value: r.avg_response_time_hours }))}
              valueFormatter={(v) => (v < 24 ? `${v.toFixed(1)}h` : `${(v / 24).toFixed(1)}j`)}
              emptyLabel="Pas encore de réponse client enregistrée."
            />
          )}
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-4 font-display text-sm font-semibold text-ink">Factures : payées vs en attente</h2>
          {loadingInvoices ? (
            <Spinner />
          ) : (
            <Donut
              segments={[
                { label: 'Payées', value: invoices?.paid || 0, color: 'var(--cyan)' },
                { label: 'En attente', value: invoices?.unpaid || 0, color: 'var(--indigo)' },
                { label: 'En retard', value: invoices?.overdue || 0, color: '#c0392b' },
              ]}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
