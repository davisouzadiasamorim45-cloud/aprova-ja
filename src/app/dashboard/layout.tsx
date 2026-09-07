import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/ui/logo";
import { Avatar } from "@/components/ui/avatar";
import { DashboardNav } from "@/components/dashboard-nav";
import { TimerFlutuante } from "@/components/timer-flutuante";

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
    .select("full_name, plan, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const nomeExibido = profile?.full_name || user.email || "";
  const iniciais = nomeExibido
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-200 bg-surface px-4 py-6 md:fixed md:inset-y-0 md:left-0 md:flex md:overflow-y-auto">
        {/* Dentro do dashboard a logo volta pra home do próprio app, não pro
            site público — senão parece que a pessoa "desconectou" ao cair
            na landing page de marketing (mesmo com a sessão intacta). */}
        <Link href="/dashboard" className="mb-8 px-2">
          <Logo />
        </Link>

        <DashboardNav />

        <div className="mt-4 border-t border-ink-200 pt-4">
          <Link
            href="/dashboard/perfil"
            className="flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-ink-100"
            title="Ver perfil e configurações"
          >
            <Avatar avatarUrl={profile?.avatar_url} iniciais={iniciais} tamanho={36} className="h-9 w-9 text-xs" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink-800">{nomeExibido}</p>
              {/* Discreto de propósito: é um lembrete do plano, não um selo —
                  o CTA de upgrade já mora na página de Planos. */}
              <span className="mt-0.5 inline-flex items-center rounded-full bg-gold-50 px-2 py-0.5 text-[10px] font-medium text-gold-700">
                Plano {profile?.plan ?? "free"}
              </span>
            </div>
          </Link>
        </div>
      </aside>

      <div className="flex-1 md:ml-64">
        <header className="flex items-center justify-between border-b border-ink-200 bg-surface px-4 py-3 md:hidden">
          <Link href="/dashboard">
            <Logo />
          </Link>
          <Link href="/dashboard/perfil" aria-label="Ver perfil e configurações" title="Perfil">
            <Avatar avatarUrl={profile?.avatar_url} iniciais={iniciais} tamanho={36} className="h-9 w-9 text-xs" />
          </Link>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-8 pb-24 md:px-8 md:pb-8">{children}</main>

        <DashboardNav variant="bottom" />
        <TimerFlutuante />
      </div>
    </div>
  );
}
