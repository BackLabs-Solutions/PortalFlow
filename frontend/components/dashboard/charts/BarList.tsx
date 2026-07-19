export function BarList({
  data,
  valueFormatter = (v) => String(v),
  color = 'var(--indigo)',
  emptyLabel = 'Aucune donnée pour le moment.',
}: {
  data: { label: string; value: number }[];
  valueFormatter?: (value: number) => string;
  color?: string;
  emptyLabel?: string;
}) {
  if (data.length === 0) {
    return <p className="py-4 text-center text-sm text-slate">{emptyLabel}</p>;
  }

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-ink">{d.label}</span>
            <span className="font-mono text-slate tabular-nums">{valueFormatter(d.value)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-mist">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.max((d.value / max) * 100, 3)}%`, background: color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
