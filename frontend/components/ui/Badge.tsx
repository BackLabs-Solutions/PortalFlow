const statusStyles: Record<string, string> = {
  active: 'bg-cyan/12 text-[#0f7f96]',
  completed: 'bg-indigo/10 text-indigo',
  archived: 'bg-slate/10 text-slate',
  pending: 'bg-amber-500/10 text-amber-600',
  approved: 'bg-cyan/12 text-[#0f7f96]',
  rejected: 'bg-danger/10 text-danger',
  sent: 'bg-indigo/10 text-indigo',
  overdue: 'bg-danger/10 text-danger',
  paid: 'bg-cyan/12 text-[#0f7f96]',
  todo: 'bg-slate/10 text-slate',
  doing: 'bg-indigo/10 text-indigo',
  blocked: 'bg-danger/10 text-danger',
  done: 'bg-cyan/12 text-[#0f7f96]',
  draft: 'bg-slate/10 text-slate',
  signed: 'bg-cyan/12 text-[#0f7f96]',
  declined: 'bg-danger/10 text-danger',
};

const labels: Record<string, string> = {
  active: 'Actif',
  completed: 'Terminé',
  archived: 'Archivé',
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Refusé',
  sent: 'Envoyée',
  overdue: 'En retard',
  paid: 'Payée',
  todo: 'À faire',
  doing: 'En cours',
  blocked: 'Bloqué',
  done: 'Terminé',
  draft: 'Brouillon',
  signed: 'Signé',
  declined: 'Refusé',
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
