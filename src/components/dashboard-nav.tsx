"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck2,
  ChartColumn,
  GraduationCap,
  Home,
  LayoutGrid,
  Layers,
  MoreHorizontal,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Visão geral", icon: Home },
  { href: "/dashboard/questoes", label: "Questões", icon: LayoutGrid },
  { href: "/dashboard/cronograma", label: "Cronograma", icon: CalendarCheck2 },
  { href: "/dashboard/flashcards", label: "Flashcards", icon: Layers },
  { href: "/dashboard/estatisticas", label: "Estatísticas", icon: ChartColumn },
  { href: "/dashboard/concursos", label: "Concursos", icon: GraduationCap },
  { href: "/dashboard/planos", label: "Planos", icon: Wallet },
];

// No menu inferior (mobile) só cabem 4 atalhos + "Mais"; o restante fica no sheet.
const ITENS_BARRA_INFERIOR = NAV_ITEMS.slice(0, 4);
const ITENS_MENU_MAIS = NAV_ITEMS.slice(4);

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

export function DashboardNav({ variant = "sidebar" }: { variant?: "sidebar" | "bottom" }) {
  const pathname = usePathname();
  const [maisAberto, setMaisAberto] = useState(false);

  if (variant === "bottom") {
    const maisAtivo = ITENS_MENU_MAIS.some((item) => isActive(pathname, item.href));

    return (
      <>
        {maisAberto && (
          <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/40 md:hidden" onClick={() => setMaisAberto(false)}>
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full rounded-t-2xl border-t border-ink-200 bg-surface p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-soft-lg animate-fade-up"
            >
              <div className="flex items-center justify-between px-3 py-2">
                <p className="text-sm font-semibold text-ink-900">Mais</p>
                <button onClick={() => setMaisAberto(false)} aria-label="Fechar" className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-col gap-0.5 pb-1">
                {ITENS_MENU_MAIS.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMaisAberto(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium",
                        active ? "bg-brand-50 text-brand-800" : "text-ink-700"
                      )}
                    >
                      <item.icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.3 : 1.9} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <nav className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-ink-200 bg-surface/95 py-1.5 backdrop-blur-sm md:hidden">
          {ITENS_BARRA_INFERIOR.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] font-medium transition-colors",
                  active ? "text-brand-700" : "text-ink-500"
                )}
              >
                <item.icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                {item.label.split(" ")[0]}
              </Link>
            );
          })}
          <button
            onClick={() => setMaisAberto(true)}
            className={cn(
              "flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] font-medium transition-colors",
              maisAtivo ? "text-brand-700" : "text-ink-500"
            )}
          >
            <MoreHorizontal className="h-5 w-5" strokeWidth={maisAtivo ? 2.4 : 2} />
            Mais
          </button>
        </nav>
      </>
    );
  }

  return (
    <nav className="flex flex-1 flex-col gap-0.5">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-brand-50 text-brand-800" : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
            )}
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.3 : 1.9} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
