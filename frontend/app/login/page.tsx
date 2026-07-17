'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Mail, CheckCircle2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');

  const mutation = useMutation({
    mutationFn: (email: string) => api.sendMagicLink(email),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    mutation.mutate(email);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-mist px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo size={40} />
        </div>

        <div className="rounded-card border border-line bg-surface p-8 shadow-soft">
          {mutation.isSuccess ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan/12 text-[#0f7f96]">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <p className="font-display text-lg font-semibold text-ink">Vérifiez votre email</p>
                <p className="mt-1.5 text-sm text-slate">
                  Un lien de connexion a été envoyé à <span className="font-medium text-ink">{email}</span>.
                </p>
              </div>
              <button
                onClick={() => mutation.reset()}
                className="text-sm font-medium text-indigo hover:underline"
              >
                Utiliser une autre adresse
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <h1 className="font-display text-xl font-semibold text-ink">Connexion</h1>
                <p className="mt-1 text-sm text-slate">
                  Recevez un lien magique par email, aucun mot de passe requis.
                </p>
              </div>

              <Input
                id="email"
                type="email"
                label="Adresse email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
              />

              {mutation.isError && (
                <p className="text-sm text-danger">
                  {mutation.error instanceof ApiError ? mutation.error.message : 'Une erreur est survenue.'}
                </p>
              )}

              <Button type="submit" loading={mutation.isPending} className="w-full">
                <Mail size={15} />
                Envoyer le lien magique
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
