import Link from "next/link";
import { ArrowLeft, CalendarCheck2, Check, Layers, Target } from "lucide-react";
import { LogoMark, Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const DESTAQUES = [
  { icone: CalendarCheck2, texto: "Cronograma montado em 10 minutos" },
  { icone: Target, texto: "Questões reais, filtradas por banca" },
  { icone: Layers, texto: "Flashcards que voltam na hora certa" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[50%_1fr]">
      {/* Painel de marca — só no desktop. Verde-floresta com cores fixas (não os
          tokens brand-*, que se invertem no tema escuro): esta faixa é sempre
          verde profundo, como a seção de planos da landing. z-10 + sombra à
          direita pra criar profundidade e suavizar a emenda com o formulário. */}
      <aside className="relative z-10 hidden overflow-hidden bg-[linear-gradient(145deg,#175f48_0%,#123f31_40%,#0c3025_68%,#061d16_100%)] bg-grain lg:flex lg:flex-col lg:justify-between lg:p-12 lg:shadow-[36px_0_64px_-30px_rgba(0,0,0,0.55)] xl:p-16">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <span className="absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-[#3a9f74]/14 blur-3xl" />
          <span className="absolute -bottom-28 -right-28 h-[28rem] w-[28rem] rounded-full bg-[#e7a934]/10 blur-3xl" />
          <span className="absolute -bottom-40 -left-24 h-[30rem] w-[30rem] rounded-full border border-white/10" />
          <span className="absolute -bottom-24 -left-4 h-80 w-80 rounded-full border border-white/[0.06]" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <LogoMark tone="onDark" className="h-8 w-8" />
            <span className="flex flex-col">
              <span className="text-lg font-extrabold leading-none tracking-tight text-white">aprova já</span>
              <span className="mt-1.5 text-[10px] font-semibold uppercase leading-none tracking-[0.14em] text-white/55">
                Plataforma de estudos para concursos
              </span>
            </span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="font-display text-4xl font-semibold leading-[1.12] text-white xl:text-5xl">
            Sua aprovação começa com um plano.
          </h2>
          <p className="mt-4 text-white/70">
            Tudo o que você precisa pra treinar de verdade — organizado num lugar só, do briefing do
            edital até o dia da prova.
          </p>

          <ul className="mt-9 flex flex-col gap-3">
            {DESTAQUES.map((d) => (
              <li key={d.texto} className="flex items-center gap-3 text-sm text-white/85">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#efc157]">
                  <d.icone className="h-[18px] w-[18px]" strokeWidth={2} />
                </span>
                {d.texto}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 flex items-center gap-2 text-xs text-white/60">
          <Check className="h-3.5 w-3.5 text-[#efc157]" strokeWidth={3} />
          Grátis pra começar — sem cartão de crédito.
        </p>
      </aside>

      {/* Formulário — sem "caixa": os campos flutuam sobre o fundo do tema, com um
          brilho verde suave atrás pra amarrar com o painel da esquerda (e dar
          vida à tela no mobile, onde o painel some). O verde aqui é de baixa
          opacidade de propósito: um gradiente chapado quebraria o contraste dos
          rótulos no tema claro. */}
      <div className="relative flex min-h-screen flex-col overflow-y-auto bg-background bg-grain">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {/* brilho de topo — vale no mobile, onde o painel some */}
          <div className="absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(70%_60%_at_50%_0%,rgba(35,146,108,0.14),transparent_75%)]" />
          {/* luz "vazando" do painel verde: brilho grande ancorado na emenda + um
              lençol horizontal que se dissolve, pra amarrar os dois lados */}
          <div className="absolute -left-48 -top-32 hidden h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(circle,rgba(35,146,108,0.13),transparent_70%)] lg:block" />
          <div className="absolute inset-y-0 left-0 hidden w-2/3 bg-[linear-gradient(to_right,rgba(35,146,108,0.09),transparent)] lg:block" />
          <div className="absolute bottom-0 right-0 h-96 w-96 bg-[radial-gradient(circle_at_bottom_right,rgba(231,169,52,0.08),transparent_70%)]" />
        </div>

        <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-ink-900"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar ao início
          </Link>
          <ThemeToggle />
        </header>

        <div className="relative z-10 flex flex-1 items-center justify-center px-6 pb-16 pt-4 sm:px-10">
          <div className="w-full max-w-sm animate-fade-up">
            <div className="mb-8 lg:hidden">
              <Link href="/" className="inline-flex">
                <Logo />
              </Link>
            </div>
            <LogoMark className="mb-6 hidden h-10 w-10 lg:block" />

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
