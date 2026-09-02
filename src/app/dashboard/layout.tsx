import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/lib/auth/actions";
import { Logo } from "@/components/ui/logo";
import { DashboardNav } from "@/components/dashboard-nav";

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

  const nomeExibido = profile?.full_name || user.email || "";
  const iniciais = nomeExibido
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-200 bg-white px-4 py-6 md:flex">
        <Link href="/" className="mb-8 px-2">
          <Logo />
        </Link>

        <DashboardNav />

        <div className="mt-4 flex items-center gap-3 border-t border-ink-200 pt-4 px-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800">
            {iniciais || "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink-800">{nomeExibido}</p>
            <p className="text-xs font-medium uppercase tracking-wide text-gold-600">Plano {profile?.plan ?? "free"}</p>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              aria-label="Sair"
              title="Sair"
              className="rounded-lg p-2 text-ink-400 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-ink-200 bg-white px-4 py-3 md:hidden">
          <Link href="/">
            <Logo />
          </Link>
          <form action={signOutAction}>
            <button type="submit" aria-label="Sair" className="rounded-lg p-2 text-ink-500">
              <LogOut className="h-5 w-5" />
            </button>
          </form>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-8 pb-24 md:px-8 md:pb-8">{children}</main>

        <DashboardNav variant="bottom" />
      </div>
    </div>
  );
}
