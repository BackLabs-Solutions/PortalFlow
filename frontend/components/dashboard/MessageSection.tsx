'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Send } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function MessageSection({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', projectId],
    queryFn: () => api.getMessages(projectId),
  });

  const send = useMutation({
    mutationFn: (content: string) => api.createMessage(projectId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', projectId] });
      setContent('');
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Échec de l'envoi"),
  });

  return (
    <Card className="p-5">
      <h3 className="mb-4 font-display text-sm font-semibold text-ink">Messages</h3>

      {isLoading ? (
        <Spinner />
      ) : messages && messages.length > 0 ? (
        <ul className="mb-4 max-h-72 space-y-3 overflow-y-auto pr-1">
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
        <p className="mb-4 py-2 text-center text-sm text-slate">Aucun message pour le moment.</p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (content.trim()) send.mutate(content.trim());
        }}
        className="flex gap-2"
      >
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
      </form>
    </Card>
  );
}
