'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Key, Copy, Check, RefreshCw } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.getProfile(),
  });

  const [name, setName] = useState('');
  const [brandColor, setBrandColor] = useState('#3B4CCA');
  const [copied, setCopied] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setBrandColor(profile.brandColor || '#3B4CCA');
    }
  }, [profile]);

  const saveProfile = useMutation({
    mutationFn: () => api.updateProfile({ name, brandColor }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profil mis à jour');
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Échec de la sauvegarde'),
  });

  const generateKey = useMutation({
    mutationFn: () => api.generateApiKey(),
    onSuccess: (res) => {
      setApiKey(res.apiKey);
      toast.success('Nouvelle clé API générée');
    },
  });

  const copyKey = async () => {
    if (!apiKey) return;
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Paramètres</h1>
        <p className="mt-1 text-sm text-slate">Profil, marque et intégrations.</p>
      </div>

      <Card className="space-y-4 p-5">
        <h2 className="font-display text-sm font-semibold text-ink">Profil</h2>
        <Input label="Adresse email" value={profile?.email || ''} disabled />
        <Input label="Nom" value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom" />
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-indigo/10 px-2.5 py-1 font-mono text-xs font-medium text-indigo">
            Plan {profile?.tier}
          </span>
        </div>
        <div>
          <Button loading={saveProfile.isPending} onClick={() => saveProfile.mutate()}>
            Enregistrer
          </Button>
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="font-display text-sm font-semibold text-ink">Marque</h2>
        <div className="flex items-center gap-3">
          <label htmlFor="brandColor" className="text-sm font-medium text-ink">
            Couleur de marque
          </label>
          <input
            id="brandColor"
            type="color"
            value={brandColor}
            onChange={(e) => setBrandColor(e.target.value)}
            className="h-9 w-14 cursor-pointer rounded-control border border-line bg-surface"
          />
          <span className="font-mono text-xs text-slate">{brandColor}</span>
        </div>
        <p className="text-xs text-slate">
          Cette couleur personnalise le portail que voient vos clients (plan Pro et Agence).
        </p>
        <div>
          <Button loading={saveProfile.isPending} onClick={() => saveProfile.mutate()}>
            Enregistrer
          </Button>
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <Key size={15} className="text-indigo" />
          <h2 className="font-display text-sm font-semibold text-ink">Clé API — Zapier</h2>
        </div>
        <p className="text-sm text-slate">
          Utilisez cette clé pour connecter PortalFlow à Zapier. Générer une nouvelle clé invalide
          l&apos;ancienne.
        </p>

        {apiKey && (
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-control border border-line bg-mist px-3 py-2 font-mono text-xs text-ink">
              {apiKey}
            </code>
            <button
              onClick={copyKey}
              aria-label="Copier la clé"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control border border-line text-slate hover:text-indigo"
            >
              {copied ? <Check size={15} className="text-[#0f7f96]" /> : <Copy size={15} />}
            </button>
          </div>
        )}

        <Button variant="secondary" loading={generateKey.isPending} onClick={() => generateKey.mutate()}>
          <RefreshCw size={15} />
          {apiKey ? 'Régénérer la clé' : 'Générer une clé API'}
        </Button>
      </Card>
    </div>
  );
}
