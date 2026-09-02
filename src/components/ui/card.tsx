import { cn } from "@/lib/cn";

const cardClass = "rounded-2xl border border-ink-200/70 bg-white shadow-soft";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(cardClass, className)} {...props} />;
}

/** Variante que renderiza um <form> com a mesma aparência de Card. */
export function CardForm({ className, ...props }: React.FormHTMLAttributes<HTMLFormElement>) {
  return <form className={cn(cardClass, className)} {...props} />;
}

/** Classe para links/botões que devem parecer um Card clicável (dashboard, atalhos). */
export const cardLinkClass = cn(
  "group rounded-2xl border border-ink-200/70 bg-white shadow-soft transition-all duration-150",
  "hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-soft-lg"
);
