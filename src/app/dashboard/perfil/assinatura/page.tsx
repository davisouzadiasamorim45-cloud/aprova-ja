import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { buscarInfoPagamento } from "@/lib/stripe/pagamento";
import { AssinaturaAcoes } from "@/components/assinatura-acoes";
import { MetodosPagamento } from "@/components/metodos-pagamento";

export default async function AssinaturaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: assinatura } = await supabase
    .from("assinaturas")
    .select("plano, status, stripe_customer_id, stripe_subscription_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const planoAtual = assinatura?.plano ?? "free";
  const { metodos, assinatura: infoStripe } = await buscarInfoPagamento(
    assinatura?.stripe_customer_id,
    assinatura?.stripe_subscription_id
  );

  return (
    <div>
      <Link href="/dashboard/perfil" className="inline-flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-800">
        <ChevronLeft className="h-4 w-4" /> Perfil
      </Link>

      <h1 className="mt-3 font-display text-2xl font-semibold text-ink-900">Pagamento e assinatura</h1>
      <p className="mt-1 text-sm text-ink-500">
        Plano atual: <span className="font-semibold capitalize text-ink-700">{planoAtual}</span>
        {assinatura?.status === "active" && " · assinatura ativa"}
      </p>

      {planoAtual === "free" ? (
        <p className="mt-6 text-sm text-ink-500">
          Você está no plano grátis, sem cobrança. Pra assinar um plano pago, veja a{" "}
          <Link href="/dashboard/planos" className="font-medium text-brand-700 hover:underline">
            página de Planos
          </Link>
          .
        </p>
      ) : (
        <>
          <h2 className="mt-8 font-display text-lg font-semibold text-ink-900">Sua assinatura</h2>
          <div className="mt-3">
            <AssinaturaAcoes
              planoAtual={planoAtual}
              canceladaNoFim={infoStripe?.canceladaNoFim ?? false}
              fimPeriodo={infoStripe?.fimPeriodo ?? null}
            />
          </div>

          <h2 className="mt-8 font-display text-lg font-semibold text-ink-900">Forma de pagamento</h2>
          <p className="mt-1 text-sm text-ink-500">Cartão principal e cartões extras usados na cobrança.</p>
          <div className="mt-3">
            <MetodosPagamento metodos={metodos} />
          </div>
        </>
      )}
    </div>
  );
}
