'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { setToken } from '@/lib/auth';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';

function VerifyContent() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Lien invalide : aucun token trouvé.');
      return;
    }

    api
      .verifyToken(token)
      .then((res) => {
        setToken(res.token);
        router.replace('/dashboard');
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Ce lien a expiré ou est invalide.');
      });
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-mist px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo size={40} />
        </div>
        <div className="rounded-card border border-line bg-surface p-8 shadow-soft">
          {error ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
                <AlertCircle size={22} />
              </div>
              <div>
                <p className="font-display text-lg font-semibold text-ink">Lien expiré</p>
                <p className="mt-1.5 text-sm text-slate">{error}</p>
              </div>
              <Button onClick={() => router.replace('/login')} className="w-full">
                Demander un nouveau lien
              </Button>
            </div>
          ) : (
            <Spinner label="Connexion en cours…" />
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<Spinner label="Chargement…" />}>
      <VerifyContent />
    </Suspense>
  );
}
