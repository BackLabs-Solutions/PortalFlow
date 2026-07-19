'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CreditCard, ExternalLink, Check } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const PLANS = [
  { tier: 'pro' as const, name: 'Pro', price: '49€/mois', features: ['Projets illimités', 'Branding complet', 'Intégration Zapier'] },
  { tier: 'agency' as const, name: 'Agence', price: '149€/mois', features: ['Tout Pro', 'White-label', 'Sous-comptes'] },
];

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function BillingSection({ currentTier }: { currentTier: string }) {
  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => api.getSubscription(),
  });

  const checkout = useMutation({
    mutationFn: (tier: 'pro' | 'agency') => api.createCheckoutSession(tier),
    onSuccess: (res) => {
      window.location.href = res.checkout_url;
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Échec de l'ouverture du paiement"),
  });

  const portal = useMutation({
    mutationFn: () => api.getBillingPortalUrl(),
    onSuccess: (res) => {
      window.location.href = res.portal_url;
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Impossible d'ouvrir le portail de facturation"),
  });

  const cancel = useMutation({
    mutationFn: () => api.cancelSubscription(),
    onSuccess: () => toast.success('Abonnement résilié — actif jusqu\'à la fin de la période en cours'),
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Échec de la résiliation'),
  });

  return (
    <Card className="space-y-4 p-5">
      <div className="flex items-center gap-2">
        <CreditCard size={15} className="text-indigo" />
        <h2 className="font-display text-sm font-semibold text-ink">Abonnement</h2>
      </div>

      {currentTier !== 'free' && subscription && (
        <div className="rounded-control bg-mist p-3 text-sm text-ink">
          <p>
            Plan actuel : <span className="font-medium capitalize">{subscription.tier}</span>
            {subscription.status === 'active' && ' — actif'}
          </p>
          {subscription.currentPeriodEnd && !subscription.cancelAt && (
            <p className="mt-1 text-xs text-slate">Prochain renouvellement le {formatDate(subscription.currentPeriodEnd)}</p>
          )}
          {subscription.cancelAt && (
            <p className="mt-1 text-xs text-slate">Se termine le {formatDate(subscription.cancelAt)}</p>
          )}
        </div>
      )}

      {currentTier === 'free' && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PLANS.map((plan) => (
            <div key={plan.tier} className="rounded-control border border-line p-4">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="font-display text-sm font-semibold text-ink">{plan.name}</span>
                <span className="font-mono text-xs text-slate">{plan.price}</span>
              </div>
              <ul className="mb-3 space-y-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-1.5 text-xs text-slate">
                    <Check size={12} className="text-[#0f7f96]" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                loading={checkout.isPending}
                onClick={() => checkout.mutate(plan.tier)}
              >
                Passer {plan.name}
              </Button>
            </div>
          ))}
        </div>
      )}

      {currentTier !== 'free' && (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" loading={portal.isPending} onClick={() => portal.mutate()}>
            <ExternalLink size={15} />
            Gérer la facturation
          </Button>
          {!subscription?.cancelAt && (
            <Button variant="ghost" loading={cancel.isPending} onClick={() => cancel.mutate()}>
              Résilier
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
