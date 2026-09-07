import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, FileText, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { AlterarSenhaForm } from "@/components/alterar-senha-form";
import { AlterarEmailForm } from "@/components/alterar-email-form";
import { ExcluirConta } from "@/components/excluir-conta";

export default async function SegurancaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div>
      <Link href="/dashboard/perfil" className="inline-flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-800">
        <ChevronLeft className="h-4 w-4" /> Perfil
      </Link>

      <h1 className="mt-3 font-display text-2xl font-semibold text-ink-900">Segurança e privacidade</h1>
      <p className="mt-1 text-sm text-ink-500">Senha, e-mail, seus dados e a exclusão da conta.</p>

      <h2 className="mt-8 font-display text-lg font-semibold text-ink-900">Senha</h2>
      <Card className="mt-3 p-5">
        <AlterarSenhaForm />
      </Card>

      <h2 className="mt-8 font-display text-lg font-semibold text-ink-900">E-mail</h2>
      <Card className="mt-3 p-5">
        <AlterarEmailForm emailAtual={user.email ?? ""} />
      </Card>

      <h2 className="mt-8 font-display text-lg font-semibold text-ink-900">Seus dados</h2>
      <Card className="mt-3 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
          <p className="text-sm text-ink-600">
            Veja como tratamos seus dados e as regras de uso do AprovaJá.
          </p>
        </div>
        <div className="flex shrink-0 gap-4 text-sm font-medium text-brand-700">
          <Link href="/termos" target="_blank" className="hover:underline">
            Termos de Serviço
          </Link>
          <Link href="/privacidade" target="_blank" className="hover:underline">
            Política de Privacidade
          </Link>
        </div>
      </Card>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-400">
        <ShieldCheck className="h-3.5 w-3.5" /> Você pode pedir a exclusão dos seus dados a qualquer momento, abaixo.
      </p>

      <ExcluirConta />
    </div>
  );
}
