"use client";

import { useState } from "react";
import Image from "next/image";
import { CalendarCheck2, ChartColumn, Home, LayoutGrid, Layers } from "lucide-react";
import { cn } from "@/lib/cn";

const TELAS = [
  {
    id: "dashboard",
    label: "Visão geral",
    icon: Home,
    img: "/screenshots/dashboard.png",
    titulo: "Seu painel do dia, sem precisar procurar nada",
    descricao:
      "Assim que você entra, já vê quantos flashcards tem pra revisar hoje, sua taxa de acerto geral e o que está no cronograma — com atalhos diretos pra continuar de onde parou.",
  },
  {
    id: "questoes",
    label: "Questões",
    icon: LayoutGrid,
    img: "/screenshots/questoes.png",
    titulo: "Pratique questões e veja o resultado na hora",
    descricao:
      "Filtre por concurso, matéria e dificuldade, responda e receba feedback imediato — certo ou errado, com comentário explicando a resposta. Cada tentativa alimenta suas estatísticas.",
  },
  {
    id: "cronograma",
    label: "Cronograma",
    icon: CalendarCheck2,
    img: "/screenshots/cronograma.png",
    titulo: "Uma semana de estudos organizada por matéria",
    descricao:
      "Adicione itens de estudo por dia da semana, marque o que já foi concluído e acompanhe o total de horas planejadas — tudo editável a qualquer momento.",
  },
  {
    id: "flashcards",
    label: "Flashcards",
    icon: Layers,
    img: "/screenshots/flashcards.png",
    titulo: "Memorize com repetição espaçada de verdade",
    descricao:
      "Crie baralhos e cartões (pergunta/resposta) por assunto. O algoritmo SM-2 calcula o momento ideal de revisar cada um — o que você mais esquece volta mais rápido.",
  },
  {
    id: "estatisticas",
    label: "Estatísticas",
    icon: ChartColumn,
    img: "/screenshots/estatisticas.png",
    titulo: "Saiba exatamente onde focar antes da prova",
    descricao:
      "Acompanhe sua taxa de acerto geral, sua evolução nos últimos 14 dias e o desempenho por matéria — pra treinar mais onde você mais precisa, não onde já está bom.",
  },
];

export function ProductShowcase() {
  const [ativa, setAtiva] = useState(TELAS[0].id);
  const tela = TELAS.find((t) => t.id === ativa) ?? TELAS[0];

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {TELAS.map((t) => {
          const ativo = t.id === ativa;
          return (
            <button
              key={t.id}
              onClick={() => setAtiva(t.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                ativo
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-ink-200 bg-white text-ink-600 hover:border-brand-300 hover:text-brand-700"
              )}
            >
              <t.icon className="h-4 w-4" strokeWidth={2} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mx-auto mt-8 max-w-2xl text-center">
        <h3 className="font-display text-xl font-semibold text-ink-900 sm:text-2xl">{tela.titulo}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-600 sm:text-base">{tela.descricao}</p>
      </div>

      <div className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-soft-lg">
        <div className="flex items-center gap-1.5 border-b border-ink-100 bg-ink-50 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-ink-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink-300" />
        </div>
        <div className="relative aspect-[1280/800] w-full bg-ink-50">
          <Image
            src={tela.img}
            alt={`Tela de ${tela.label} do AprovaJá`}
            fill
            className="object-cover object-top"
            sizes="(max-width: 896px) 100vw, 896px"
            priority={tela.id === "dashboard"}
          />
        </div>
      </div>
    </div>
  );
}
