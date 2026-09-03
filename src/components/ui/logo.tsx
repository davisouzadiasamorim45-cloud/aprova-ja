import { cn } from "@/lib/cn";

/**
 * Marca "aprova já": um "A" que se funde a um check — o topo forma o pico
 * (mountain "A"), e a perna direita se resolve num check, com uma parte em
 * negativo (recorte) e a cauda do check escapando pra fora da silhueta.
 * `tone="brand"` para fundos claros (traço verde); `tone="onDark"` para
 * fundos escuros/coloridos (traço branco).
 */
export function LogoMark({ className, tone = "brand" }: { className?: string; tone?: "brand" | "onDark" }) {
  const cor = tone === "onDark" ? "#ffffff" : "var(--brand-600)";
  const negativo = tone === "onDark" ? "var(--brand-600)" : "#faf8f4";

  return (
    <svg viewBox="0 0 100 100" fill="none" aria-hidden className={cn("shrink-0", className)}>
      <path d="M50 8 L18 90" stroke={cor} strokeWidth="15" strokeLinecap="round" />
      <path d="M50 8 L67 58" stroke={cor} strokeWidth="15" strokeLinecap="round" />
      <path d="M40 70 L57 88 L95 36" stroke={negativo} strokeWidth="21" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M42 71 L57 86 L93 39" stroke={cor} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Variante "app icon": a marca em branco sobre um quadrado verde arredondado. */
export function LogoTile({ className }: { className?: string }) {
  return (
    <div className={cn("flex aspect-square items-center justify-center rounded-[22%] bg-brand-600", className)}>
      <LogoMark tone="onDark" className="h-[68%] w-[68%]" />
    </div>
  );
}

/** Selo circular decorativo — "ESTUDE HOJE · APROVE AMANHÃ" ao redor da marca. */
export function LogoBadge({ className }: { className?: string }) {
  const id = "logo-badge-path";
  return (
    <svg viewBox="0 0 200 200" fill="none" aria-hidden className={cn("shrink-0", className)}>
      <circle cx="100" cy="100" r="94" stroke="var(--brand-600)" strokeWidth="1.25" opacity="0.5" />
      <circle cx="100" cy="100" r="80" stroke="var(--brand-600)" strokeWidth="1.25" opacity="0.5" strokeDasharray="1 5" />
      <path id={id} d="M100 20 A80 80 0 1 1 99.9 20" fill="none" />
      <text fontSize="10.5" letterSpacing="3.5" fontWeight="600" fill="var(--brand-700)">
        <textPath href={`#${id}`} startOffset="2%">
          ESTUDE HOJE · APROVE AMANHÃ ·
        </textPath>
      </text>
      <g transform="translate(58 58) scale(0.84)">
        <LogoMark className="h-full w-full" />
      </g>
    </svg>
  );
}

export function Logo({
  className,
  mark = true,
  tagline = false,
}: {
  className?: string;
  mark?: boolean;
  tagline?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {mark && <LogoMark className="h-[1.5em] w-[1.5em]" />}
      <span className="flex flex-col leading-none">
        <span className="font-sans text-lg font-extrabold tracking-tight text-brand-700">aprova já</span>
        {tagline && (
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-400">
            Plataforma de estudos para concursos
          </span>
        )}
      </span>
    </span>
  );
}
