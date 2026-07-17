'use client';

import { useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { File, Trash2, UploadCloud } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

function formatSize(bytes: number | null) {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function FileSection({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: files, isLoading } = useQuery({
    queryKey: ['files', projectId],
    queryFn: () => api.getFiles(projectId),
  });

  const upload = useMutation({
    mutationFn: (file: globalThis.File) =>
      api.addFile(projectId, { name: file.name, size: file.size, uploadedBy: 'freelancer' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', projectId] });
      toast.success('Fichier ajouté');
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Échec de l'ajout"),
  });

  const remove = useMutation({
    mutationFn: (fileId: string) => api.deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', projectId] });
      toast.success('Fichier supprimé');
    },
  });

  const onFileSelected = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    Array.from(fileList).forEach((file) => upload.mutate(file));
  };

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-ink">Fichiers</h3>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFileSelected(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className="mb-4 flex cursor-pointer flex-col items-center gap-2 rounded-control border border-dashed border-line py-8 text-center transition-colors hover:border-indigo/50"
      >
        <UploadCloud size={20} className="text-slate" />
        <p className="text-sm text-slate">
          Glissez un fichier ici ou <span className="font-medium text-indigo">parcourir</span>
        </p>
        <p className="text-xs text-slate/70">Mode démo — seuls les métadonnées sont enregistrées</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => onFileSelected(e.target.files)}
        />
      </div>

      {isLoading ? (
        <Spinner />
      ) : files && files.length > 0 ? (
        <ul className="space-y-1">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-center justify-between gap-3 rounded-control px-2 py-2 hover:bg-mist"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <File size={15} className="shrink-0 text-slate" />
                <span className="truncate text-sm text-ink">{file.name}</span>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="font-mono text-xs text-slate tabular-nums">{formatSize(file.size)}</span>
                <button
                  onClick={() => remove.mutate(file.id)}
                  aria-label="Supprimer"
                  className="text-slate hover:text-danger"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-4 text-center text-sm text-slate">Aucun fichier pour le moment.</p>
      )}
    </Card>
  );
}
