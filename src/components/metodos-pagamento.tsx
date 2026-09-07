"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { CreditCard, Plus, Star, Trash2 } from "lucide-react";
import {
  criarSetupIntentAction,
  definirCartaoPrincipalAction,
  removerCartaoAction,
} from "@/lib/stripe/pagamento-actions";
import type { MetodoPagamento } from "@/lib/stripe/pagamento";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { CartaoNovoForm } from "@/components/cartao-novo-form";

const BANDEIRAS: Record<string, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "American Express",
  elo: "Elo",
  hipercard: "Hipercard",
  discover: "Discover",
  diners: "Diners Club",
  jcb: "JCB",
  unionpay: "UnionPay",
};

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

function BotaoPrincipal({ paymentMethodId }: { paymentMethodId: string }) {
  const [state, formAction, pending] = useActionState(definirCartaoPrincipalAction, undefined);

  useEffect(() => {
    if (state?.error) toast.erro(state.error);
  }, [state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="payment_method_id" value={paymentMethodId} />
      <button type="submit" disabled={pending} className="text-xs font-medium text-brand-700 hover:underline disabled:opacity-50">
        {pending ? "Definindo..." : "Definir como principal"}
      </button>
    </form>
  );
}

function BotaoRemover({ paymentMethodId }: { paymentMethodId: string }) {
  const [state, formAction, pending] = useActionState(removerCartaoAction, undefined);

  useEffect(() => {
    if (state?.error) toast.erro(state.error);
  }, [state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="payment_method_id" value={paymentMethodId} />
      <button
        type="submit"
        disabled={pending}
        aria-label="Remover cartão"
        title="Remover cartão"
        className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </form>
  );
}

export function MetodosPagamento({ metodos }: { metodos: MetodoPagamento[] }) {
  const router = useRouter();
  const [modalAberto, setModalAberto] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [carregandoSetup, setCarregandoSetup] = useState(false);

  async function abrirModal() {
    if (!stripePromise) {
      toast.erro("Cobrança ainda não configurada", { descricao: "Faltam as chaves do Stripe nas variáveis de ambiente." });
      return;
    }
    setModalAberto(true);
    setCarregandoSetup(true);
    const resultado = await criarSetupIntentAction();
    setCarregandoSetup(false);
    if (resultado.error || !resultado.clientSecret) {
      toast.erro(resultado.error ?? "Não foi possível abrir o formulário de cartão.");
      setModalAberto(false);
      return;
    }
    setClientSecret(resultado.clientSecret);
  }

  function fecharModal() {
    setModalAberto(false);
    setClientSecret(null);
  }

  function aoSalvarCartao() {
    fecharModal();
    router.refresh();
  }

  return (
    <div>
      {metodos.length === 0 ? (
        <Card className="flex items-center gap-3 p-5 text-sm text-ink-500">
          <CreditCard className="h-5 w-5 shrink-0 text-ink-400" />
          Nenhum cartão salvo ainda.
        </Card>
      ) : (
        <div className="flex flex-col gap-2.5">
          {metodos.map((m) => (
            <Card key={m.id} className="flex items-center gap-3 p-4">
              <CreditCard className="h-5 w-5 shrink-0 text-ink-400" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink-900">
                  {BANDEIRAS[m.bandeira] ?? m.bandeira} •••• {m.final}
                  {m.principal && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700">
                      <Star className="h-2.5 w-2.5 fill-current" /> Principal
                    </span>
                  )}
                </p>
                <p className="text-xs text-ink-500">
                  Válido até {String(m.expMes).padStart(2, "0")}/{m.expAno}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {!m.principal && <BotaoPrincipal paymentMethodId={m.id} />}
                <BotaoRemover paymentMethodId={m.id} />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Button type="button" variant="outline" size="sm" className="mt-3" onClick={abrirModal}>
        <Plus className="h-4 w-4" /> Adicionar cartão
      </Button>

      {modalAberto && (
        <div role="presentation" onClick={fecharModal} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-label="Adicionar cartão"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm animate-fade-up rounded-2xl border border-ink-200 bg-surface p-6 shadow-soft-lg"
          >
            <h2 className="font-display text-lg font-semibold text-ink-900">Adicionar cartão</h2>
            <p className="mt-1 text-xs text-ink-500">Seus dados de cartão vão direto pra Stripe — nunca passam pelo nosso servidor.</p>

            <div className="mt-4">
              {carregandoSetup || !clientSecret ? (
                <p className="py-6 text-center text-sm text-ink-400">Carregando...</p>
              ) : (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CartaoNovoForm clientSecret={clientSecret} onSucesso={aoSalvarCartao} onCancelar={fecharModal} />
                </Elements>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
