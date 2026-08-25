import Link from "next/link";

const RECURSOS = [
  {
    icone: "📝",
    titulo: "Banco de questões com estatísticas",
    descricao: "Pratique por matéria, banca e dificuldade, e acompanhe sua evolução em tempo real.",
  },
  {
    icone: "🧠",
    titulo: "Flashcards com repetição espaçada",
    descricao: "Fixe o conteúdo com um algoritmo que revisa o que você mais esquece, no momento certo.",
  },
  {
    icone: "🗓️",
    titulo: "Cronograma personalizado",
    descricao: "Um plano de estudos por matéria e tópico, ajustado ao tempo que você tem disponível.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-lg font-bold text-slate-900">
          Aprova<span className="text-indigo-600">Já</span>
        </span>
        <nav className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Entrar
          </Link>
          <Link href="/cadastro" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            Começar grátis
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Treine para o seu concurso com <span className="text-indigo-600">método</span>, não no achismo
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          Questões, flashcards com repetição espaçada e cronograma de estudos em um único lugar — feito para
          concurseiros que já estudam a teoria e precisam de treino de verdade.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/cadastro" className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
            Criar minha conta grátis
          </Link>
          <Link href="/login" className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Já tenho conta
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-6 sm:grid-cols-3">
          {RECURSOS.map((r) => (
            <div key={r.titulo} className="rounded-2xl border border-slate-200 p-6">
              <span className="text-3xl">{r.icone}</span>
              <h3 className="mt-4 font-semibold text-slate-900">{r.titulo}</h3>
              <p className="mt-2 text-sm text-slate-600">{r.descricao}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-100 bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Planos para todo momento da sua preparação</h2>
          <p className="mt-2 text-slate-600">Comece grátis. Evolua quando fizer sentido para você.</p>
          <Link
            href="/cadastro"
            className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Ver planos e começar
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} AprovaJá. Feito para quem estuda de verdade.
      </footer>
    </div>
  );
}
