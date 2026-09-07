import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/lib/auth/actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { nomeEstado } from "@/lib/estados";
import { ConfiguracoesEstudo } from "@/components/configuracoes-estudo";
import { SeletorTema } from "@/components/seletor-tema";
import { ExcluirConta } from "@/components/excluir-conta";
import { AvatarUpload } from "@/components/avatar-upload";

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, plan, estado, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const nomeExibido = profile?.full_name || user.email || "";
  const iniciais = nomeExibido
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">Perfil</h1>
      <p className="mt-1 text-sm text-ink-500">Seus dados de conta e as preferências do cronômetro de estudo.</p>

      <Card className="mt-6 flex flex-wrap items-center gap-4 p-5">
        <AvatarUpload userId={user.id} avatarUrlInicial={profile?.avatar_url ?? null} iniciais={iniciais} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-ink-900">{nomeExibido}</p>
          <p className="truncate text-sm text-ink-500">{user.email}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-gold-100 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-gold-800">
              Plano {profile?.plan ?? "free"}
            </span>
            {profile?.estado && (
              <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-medium text-ink-600">
                {nomeEstado(profile.estado)}
              </span>
            )}
          </div>
        </div>
      </Card>

      <h2 className="mt-8 font-display text-lg font-semibold text-ink-900">Temas</h2>
      <div className="mt-3">
        <SeletorTema />
      </div>

      <h2 className="mt-8 font-display text-lg font-semibold text-ink-900">Cronômetro e alarme</h2>
      <p className="mt-1 text-sm text-ink-500">Usados nas sessões de estudo do cronograma.</p>
      <div className="mt-3">
        <ConfiguracoesEstudo />
      </div>

      {/* Ação terminal, isolada no fim da página — de propósito longe do topo,
          pra não ficar no caminho de quem só veio ajustar tema ou alarme. */}
      <div className="mt-10 flex items-center justify-between gap-4 border-t border-ink-200 pt-6">
        <div>
          <p className="text-sm font-medium text-ink-800">Sair da conta</p>
          <p className="mt-0.5 text-xs text-ink-500">Você pode entrar de novo quando quiser.</p>
        </div>
        <form action={signOutAction}>
          <Button type="submit" variant="outline" size="sm">
            Sair
          </Button>
        </form>
      </div>

      <ExcluirConta />
    </div>
  );
}
