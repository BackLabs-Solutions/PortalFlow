'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Send } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import type { Message } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function PortalMessages({
  projectId,
  messages,
  defaultEmail,
}: {
  projectId: string;
  messages: Message[];
  defaultEmail: string;
}) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState(defaultEmail);
  const [content, setContent] = useState('');

  const send = useMutation({
    mutationFn: () => api.createPortalMessage(projectId, { content, userEmail: email || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', projectId] });
      setContent('');
      toast.success('Message envoyé');
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Échec de l'envoi"),
  });

  return (
    <Card className="space-y-4 p-6">
      <h2 className="font-display text-base font-semibold text-ink">Messages</h2>

      {messages.length > 0 ? (
        <ul className="max-h-72 space-y-3 overflow-y-auto pr-1">
          {messages.map((msg) => (
            <li key={msg.id} className="rounded-control bg-mist p-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-ink">{msg.userEmail || 'Inconnu'}</span>
                <span className="font-mono text-xs text-slate">{formatTime(msg.createdAt)}</span>
              </div>
              <p className="text-sm text-ink">{msg.content}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate">Aucun message pour le moment.</p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (content.trim()) send.mutate();
        }}
        className="space-y-2 border-t border-line pt-4"
      >
        <Input
          type="email"
          placeholder="Votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="flex gap-2">
          <Textarea
            placeholder="Écrire un message…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            className="flex-1 resize-none"
          />
          <Button type="submit" loading={send.isPending} className="self-end">
            <Send size={15} />
          </Button>
        </div>
      </form>
    </Card>
  );
}
