const statusStyles: Record<string, string> = {
  active: 'bg-cyan/12 text-[#0f7f96]',
  completed: 'bg-indigo/10 text-indigo',
  archived: 'bg-slate/10 text-slate',
  pending: 'bg-amber-500/10 text-amber-600',
  approved: 'bg-cyan/12 text-[#0f7f96]',
  rejected: 'bg-danger/10 text-danger',
};

const labels: Record<string, string> = {
  active: 'Actif',
  completed: 'Terminé',
  archived: 'Archivé',
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Refusé',
};

export function Badge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium font-mono tracking-wide ${
        statusStyles[status] || 'bg-slate/10 text-slate'
      }`}
    >
      {labels[status] || status}
    </span>
  );
}
