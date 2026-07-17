export function Logo({ size = 32, withWordmark = true }: { size?: number; withWordmark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <rect x="13" y="13" width="74" height="74" rx="23" stroke="#3B4CCA" strokeWidth="10" />
        <rect x="41" y="41" width="34" height="34" rx="13" fill="#22C0DE" />
      </svg>
      {withWordmark && (
        <span className="font-display text-lg font-semibold tracking-tight text-ink">
          Portal<span className="text-indigo">Flow</span>
        </span>
      )}
    </div>
  );
}
