"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Revela o conteúdo com um leve fade + subida quando entra na tela,
 * pra dar mais sensação de "premium" ao rolar a landing page.
 * Sem dependência externa — IntersectionObserver simples.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Já nasce "visível" se o usuário prefere menos movimento — evita depender
  // de setState síncrono dentro do efeito abaixo.
  const [visivel, setVisivel] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (visivel) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisivel(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só precisa rodar uma vez no mount
  }, []);

  return (
    <div
      ref={ref}
      className={cn("transition-all duration-700 ease-out", visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6", className)}
      style={{ transitionDelay: visivel ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
