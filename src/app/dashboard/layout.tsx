import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/lib/auth/actions";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Visão geral", icon: "🏠" },
  { href: "/dashboard/questoes", label: "Questões", icon: "📝" },
  { href: "/dashboard/estatisticas", label: "Estatísticas", icon: "📊" },
  { href: "/dashboard/cronograma", label: "Cronograma", icon: "🗓️" },
  { href: "/dashboard/flashcards", label: "Flashcards", icon: "🧠" },
  { href: "/dashboard/concursos", label: "Concursos", icon: "🏛️" },
  { href: "/dashboard/planos", label: "Plano e assinatura", icon: "💳" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, plan")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 md:flex">
        <Link href="/" className="mb-8 px-2 text-lg font-bold text-slate-900">
          Aprova<span className="text-indigo-600">Já</span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-4 border-t border-slate-200 pt-4">
          <p className="truncate px-2 text-sm font-medium text-slate-700">
            {profile?.full_name || user.email}
          </p>
          <p className="px-2 text-xs uppercase tracking-wide text-indigo-600">
            Plano {profile?.plan ?? "free"}
          </p>
          <form action={signOutAction}>
            <button
              type="submit"
              className="mt-3 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Sair
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <Link href="/" className="text-lg font-bold text-slate-900">
            Aprova<span className="text-indigo-600">Já</span>
          </Link>
          <form action={signOutAction}>
            <button type="submit" className="text-sm font-medium text-slate-500">
              Sair
            </button>
          </form>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-8 md:px-8">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 flex justify-around border-t border-slate-200 bg-white py-2 md:hidden">
          {NAV_ITEMS.slice(0, 5).map((item) => (
            <Link key={item.href} href={item.href} className="flex flex-col items-center px-2 text-[11px] text-slate-600">
              <span aria-hidden className="text-lg">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
