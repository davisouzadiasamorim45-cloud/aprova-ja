import Link from "next/link";
import {
  BookOpenCheck,
  Brain,
  CalendarCheck2,
  Check,
  ChevronRight,
  ClipboardList,
  Compass,
  LineChart,
  Repeat,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { HeroShimmer } from "@/components/hero-shimmer";
import { buttonClass } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { ProductShowcase } from "@/components/product-showcase";
import { PhoneMockup } from "@/components/ui/phone-mockup";
import { PLANOS } from "@/lib/planos";

const RECURSOS = [
  {
    icone: BookOpenCheck,
    titulo: "Banco de questões com estatísticas",
    descricao: "Pratique por matéria, banca e dificuldade, e acompanhe sua evolução em tempo real.",
  },
  {
    icone: Brain,
    titulo: "Flashcards com repetição espaçada",
    descricao: "Fixe o conteúdo com um algoritmo que revisa o que você mais esquece, no momento certo.",
  },
  {
    icone: CalendarCheck2,
    titulo: "Cronograma personalizado",
    descricao: "Um plano de estudos por matéria e tópico, ajustado ao tempo que você tem disponível.",
  },
];

const PASSOS = [
  {
    numero: "01",
    icone: Compass,
    titulo: "Diga qual concurso você quer",
    descricao: "Escolha da nossa lista ou cadastre o seu. Em menos de 1 minuto o sistema já sabe o que você precisa estudar.",
  },
  {
    numero: "02",
    icone: ClipboardList,
    titulo: "Receba um cronograma pronto",
    descricao: "Com base no tempo que você tem disponível por dia, montamos uma semana de estudos por matéria — editável a qualquer momento.",
  },
  {
    numero: "03",
    icone: Repeat,
    titulo: "Treine todo dia com questões e flashcards",
    descricao: "Pratique questões reais de banca e revise o que você mais esquece, no momento exato em que começaria a esquecer.",
  },
  {
    numero: "04",
    icone: LineChart,
    titulo: "Acompanhe sua evolução",
    descricao: "Veja sua taxa de acerto por matéria e identifique exatamente onde focar antes da prova — sem achismo.",
  },
];

const PROVAS = [
  { valor: "10 min", legenda: "para montar seu cronograma inicial" },
  { valor: "SM-2", legenda: "algoritmo de repetição espaçada" },
  { valor: "R$ 0", legenda: "para começar a treinar hoje" },
];

const PERGUNTAS = [
  {
    pergunta: "Preciso já ter estudado a teoria?",
    resposta:
      "O AprovaJá é uma ferramenta de treino, não de teoria. Funciona melhor para quem já estudou o conteúdo (por curso, apostila ou videoaula) e precisa fixar e praticar — mas o cronograma te ajuda a organizar isso desde o início.",
  },
  {
    pergunta: "Funciona para qualquer concurso?",
    resposta:
      "Sim. Você pode escolher um concurso do nosso catálogo ou cadastrar o seu próprio edital com as matérias específicas — o cronograma e as questões se adaptam ao que você cadastrar.",
  },
  {
    pergunta: "Posso cancelar quando quiser?",
    resposta:
      "Sim, sem multa nem burocracia. Você gerencia sua assinatura direto pelo painel e pode voltar para o plano grátis a qualquer momento.",
  },
  {
    pergunta: "Como funciona a repetição espaçada dos flashcards?",
    resposta:
      "Usamos o algoritmo SM-2 (o mesmo por trás do Anki): cada vez que você avalia um cartão, o sistema calcula o momento ideal para revisá-lo de novo — cartões fáceis voltam depois de mais tempo, os difíceis voltam logo.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition hover:text-ink-900">
            Entrar
          </Link>
          <Link href="/cadastro" className={buttonClass("primary", "sm")}>
            Começar grátis
          </Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[560px]">
          <HeroShimmer />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-6 pt-6 pb-8 text-center sm:pt-10">
          <span className="animate-badge-in inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-2 text-xs font-semibold text-brand-700 shadow-soft">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-600" />
            </span>
            Feito para quem já estuda a teoria e precisa treinar de verdade
          </span>

          <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-ink-900 sm:text-6xl sm:leading-[1.08]">
            Treine para o seu concurso com <span className="text-brand-600">método</span>, não no achismo
            <span className="gradient-cursor" aria-hidden />
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-600">
            Questões, flashcards com repetição espaçada e cronograma de estudos em um único lugar —
            organizado para você chegar no dia da prova sabendo exatamente onde está.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/cadastro" className={buttonClass("primary", "lg")}>
              Criar minha conta grátis
            </Link>
            <Link href="/login" className={buttonClass("outline", "lg")}>
              Já tenho conta
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-14 grid max-w-3xl grid-cols-3 divide-x divide-ink-200 border-y border-ink-200 px-6 py-7">
          {PROVAS.map((p) => (
            <div key={p.valor} className="px-2 text-center sm:px-4">
              <p className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">{p.valor}</p>
              <p className="mt-1 text-xs text-ink-500 sm:text-sm">{p.legenda}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold text-ink-900">Do zero ao dia da prova, em 4 passos</h2>
          <p className="mt-3 text-ink-600">Sem planilha, sem post-it, sem perder o fio da meada.</p>
        </Reveal>

        <div className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {PASSOS.map((p, i) => (
            <Reveal key={p.titulo} delay={i * 90} className="relative">
              <div className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-soft">
                <p.icone className="h-6 w-6" strokeWidth={1.9} />
                <span className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gold-400 font-display text-[11px] font-bold text-ink-900 shadow-soft ring-2 ring-white">
                  {p.numero.replace(/^0/, "")}
                </span>
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-ink-900">{p.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{p.descricao}</p>
              {i < PASSOS.length - 1 && (
                <ChevronRight className="absolute right-[-28px] top-4 hidden h-5 w-5 text-ink-300 lg:block" aria-hidden />
              )}
            </Reveal>
          ))}
        </div>
      </section>

      {/* VITRINE DO PRODUTO */}
      <section className="border-y border-ink-200 bg-ink-50/60 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold text-ink-900">Cada tela, feita pra um passo do seu estudo</h2>
            <p className="mt-3 text-ink-600">Clique nas abas abaixo e veja como cada função funciona na prática.</p>
          </Reveal>

          <Reveal delay={100} className="mt-12">
            <ProductShowcase />
          </Reveal>
        </div>
      </section>

      {/* RECURSOS */}
      <section className="border-y border-ink-200 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold text-ink-900">Tudo que falta entre estudar e passar</h2>
            <p className="mt-3 text-ink-600">Três ferramentas que trabalham juntas para transformar teoria em aprovação.</p>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {RECURSOS.map((r, i) => (
              <Reveal
                key={r.titulo}
                delay={i * 100}
                className="rounded-2xl border border-ink-200/70 bg-white p-7 shadow-soft transition-transform duration-150 hover:-translate-y-1"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <r.icone className="h-5 w-5" strokeWidth={2} />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-ink-900">{r.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{r.descricao}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="bg-ink-900 bg-grain py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mx-auto max-w-2xl text-center text-white">
            <h2 className="font-display text-3xl font-semibold">Para todo momento da sua preparação</h2>
            <p className="mt-3 text-ink-300">Comece grátis. Evolua quando fizer sentido para você — cancele quando quiser.</p>
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {PLANOS.map((p, i) => (
              <Reveal
                key={p.id}
                delay={i * 100}
                className={`relative flex flex-col rounded-2xl border bg-white p-6 ${
                  p.recomendado ? "border-gold-400 shadow-soft-lg md:-translate-y-2" : "border-transparent shadow-soft"
                }`}
              >
                {p.recomendado && (
                  <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-gold-400 px-3 py-1 text-xs font-semibold text-ink-900">
                    <Sparkles className="h-3 w-3" /> Mais escolhido
                  </span>
                )}
                <h3 className="font-display text-lg font-semibold text-ink-900">{p.nome}</h3>
                <p className="mt-1 flex items-baseline gap-1 font-display text-2xl font-semibold text-ink-900">
                  {p.preco}
                  {p.periodo && <span className="text-sm font-medium text-ink-400">{p.periodo}</span>}
                </p>
                <p className="mt-1 text-sm text-ink-500">{p.descricao}</p>

                <ul className="mt-4 flex flex-1 flex-col gap-2.5 text-sm text-ink-600">
                  {p.recursos.map((r) => (
                    <li key={r} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" /> {r}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/cadastro"
                  className={buttonClass(p.recomendado ? "secondary" : "outline", "md", "mt-5 justify-center")}
                >
                  {p.id === "free" ? "Começar grátis" : `Assinar ${p.nome}`}
                </Link>
              </Reveal>
            ))}
          </div>

          <p className="mt-8 flex items-center justify-center gap-1.5 text-center text-xs text-ink-400">
            <ShieldCheck className="h-3.5 w-3.5" /> Sem cartão de crédito para o plano grátis
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="duvidas" className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
        <Reveal className="text-center">
          <h2 className="font-display text-3xl font-semibold text-ink-900">Perguntas frequentes</h2>
        </Reveal>

        <Reveal delay={120} className="mt-10 divide-y divide-ink-200 rounded-2xl border border-ink-200 bg-white shadow-soft">
          {PERGUNTAS.map((f) => (
            <details key={f.pergunta} className="group px-6 py-5 open:bg-brand-50/30">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink-900">
                {f.pergunta}
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-400 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-600">{f.resposta}</p>
            </details>
          ))}
        </Reveal>
      </section>

      {/* CTA FINAL */}
      <section className="overflow-hidden border-t border-ink-200 bg-white py-20 sm:py-24">
        <Reveal className="mx-auto max-w-6xl px-6">
          <div className="relative overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-gold-50 shadow-soft-lg">
            <div className="grid items-center gap-10 px-8 py-14 sm:px-12 lg:grid-cols-2 lg:py-0">
              <div className="text-center lg:text-left">
                <h2 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">Pronto para treinar com método?</h2>
                <p className="mx-auto mt-3 max-w-md text-ink-600 lg:mx-0">
                  Crie sua conta grátis agora e monte seu cronograma em menos de 10 minutos.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                  <Link href="/cadastro" className={buttonClass("primary", "lg")}>
                    Criar minha conta grátis
                  </Link>
                  <Link href="#planos" className={buttonClass("outline", "lg")}>
                    Ver planos
                  </Link>
                </div>
              </div>

              <div className="relative flex justify-center py-10 lg:py-16">
                <div aria-hidden className="pointer-events-none absolute inset-0">
                  <span className="absolute left-[15%] top-[10%] h-40 w-40 rounded-full bg-brand-300/40 blur-3xl" />
                  <span className="absolute bottom-[8%] right-[15%] h-44 w-44 rounded-full bg-gold-300/40 blur-3xl" />
                </div>
                <PhoneMockup src="/screenshots/dashboard-mobile.png" alt="Painel do AprovaJá no celular" className="relative" />
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-ink-200 bg-ink-50/60">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid gap-10 sm:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <Logo tagline />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-500">
                Questões, flashcards e cronograma de estudos em um único lugar — para quem treina de verdade.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Produto</p>
              <ul className="mt-4 flex flex-col gap-3 text-sm text-ink-600">
                <li>
                  <a href="#como-funciona" className="transition hover:text-brand-700">
                    Como funciona
                  </a>
                </li>
                <li>
                  <a href="#planos" className="transition hover:text-brand-700">
                    Planos
                  </a>
                </li>
                <li>
                  <a href="#duvidas" className="transition hover:text-brand-700">
                    Perguntas frequentes
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Conta</p>
              <ul className="mt-4 flex flex-col gap-3 text-sm text-ink-600">
                <li>
                  <Link href="/cadastro" className="transition hover:text-brand-700">
                    Criar conta grátis
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="transition hover:text-brand-700">
                    Entrar
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-ink-200 pt-6 text-xs text-ink-400 sm:flex-row">
            <p>© {new Date().getFullYear()} aprova já. Feito para quem estuda de verdade.</p>
            <p>Plataforma de estudos para concursos públicos.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
