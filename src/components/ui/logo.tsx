import { cn } from "@/lib/cn";

/** Marca: um "selo" de aprovação — círculo com check, no verde da marca. */
export function Logo({ className, mark = true }: { className?: string; mark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-display text-lg font-semibold text-ink-900", className)}>
      {mark && (
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden className="shrink-0">
          <circle cx="13" cy="13" r="13" className="fill-brand-600" />
          <path
            d="M7.5 13.2l3.4 3.4 7.1-7.6"
            stroke="var(--gold-300)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      )}
      Aprova<span className="text-brand-600">Já</span>
    </span>
  );
}
