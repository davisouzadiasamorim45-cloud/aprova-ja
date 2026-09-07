"use client";

import { useState } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "14px",
      color: "var(--color-ink-900, #1c1a17)",
      "::placeholder": { color: "var(--color-ink-400, #9c948a)" },
    },
    invalid: { color: "#dc2626" },
  },
};

// Formulário que roda dentro do <Elements> — o número do cartão fica isolado
// num iframe da própria Stripe (CardElement); a gente nunca lê nem recebe
// esse valor, só o resultado (sucesso/erro) da confirmação.
export function CartaoNovoForm({
  clientSecret,
  onSucesso,
  onCancelar,
}: {
  clientSecret: string;
  onSucesso: () => void;
  onCancelar: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setEnviando(true);
    try {
      const { error } = await stripe.confirmCardSetup(clientSecret, { payment_method: { card: cardElement } });
      if (error) {
        toast.erro(error.message ?? "Não foi possível salvar o cartão.");
        return;
      }
      toast.sucesso("Cartão adicionado.");
      onSucesso();
    } catch {
      toast.erro("Erro de conexão com a Stripe.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="rounded-xl border border-ink-300 bg-surface px-3.5 py-3">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancelar} disabled={enviando}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={!stripe || enviando}>
          {enviando ? "Salvando..." : "Salvar cartão"}
        </Button>
      </div>
    </form>
  );
}
