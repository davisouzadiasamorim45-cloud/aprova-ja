"use client";

import { useState } from "react";

type Plano = {
  id: "free" | "pro" | "premium";
  nome: string;
  preco: string;
  descricao: string;
  recursos: string[];
};

export function PlanosCliente({
  planos,
  planoAtual,
  temAssinatura,
}: {
  planos: Plano[];
  planoAtual: string;
  temAssinatura: boolean;
}) {
  const [carregando, setCarregando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function assinar(planoId: "pro" | "premium") {
    setErro(null);
    setCarregando(planoId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plano: planoId }),
      });
      const data = await res.json();
      if (data.url) {
        // eslint-disable-next-line react-hooks/immutability -- navegação de página inteira para o Stripe, fora do ciclo de render do React
        window.location.href = data.url;
      } else {
        setErro(data.error ?? "Não foi possível iniciar o checkout.");
      }
    } catch {
      setErro("Erro de conexão ao iniciar o checkout.");
    } finally {
      setCarregando(null);
    }
  }

  async function gerenciarAssinatura() {
    setErro(null);
    setCarregando("portal");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setErro(data.error ?? "Não foi possível abrir o portal de cobrança.");
      }
    } catch {
      setErro("Erro de conexão ao abrir o portal.");
    } finally {
      setCarregando(null);
    }
  }

  return (
    <div>
      {erro && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {planos.map((p) => {
          const ativo = planoAtual === p.id;
          return (
            <div
              key={p.id}
              className={`flex flex-col rounded-2xl border p-6 ${
                ativo ? "border-indigo-500 ring-1 ring-indigo-500" : "border-slate-200"
              } bg-white`}
            >
              <h3 className="text-lg font-semibold text-slate-900">{p.nome}</h3>
              <p className="mt-1 text-2xl font-bold text-slate-900">{p.preco}</p>
              <p className="mt-1 text-sm text-slate-500">{p.descricao}</p>

              <ul className="mt-4 flex flex-1 flex-col gap-2 text-sm text-slate-600">
                {p.recursos.map((r) => (
                  <li key={r} className="flex gap-2">
                    <span className="text-emerald-500">✓</span> {r}
                  </li>
                ))}
              </ul>

              {p.id === "free" ? (
                <span className="mt-5 rounded-lg bg-slate-100 px-4 py-2 text-center text-sm font-semibold text-slate-500">
                  {ativo ? "Plano atual" : "Plano padrão"}
                </span>
              ) : ativo ? (
                <button
                  onClick={gerenciarAssinatura}
                  disabled={carregando === "portal"}
                  className="mt-5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  {carregando === "portal" ? "Abrindo..." : "Gerenciar assinatura"}
                </button>
              ) : (
                <button
                  onClick={() => assinar(p.id as "pro" | "premium")}
                  disabled={carregando === p.id}
                  className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {carregando === p.id ? "Redirecionando..." : `Assinar ${p.nome}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {temAssinatura === false && (
        <p className="mt-4 text-xs text-slate-400">Você está no plano gratuito. Assine um plano pago para desbloquear todos os recursos.</p>
      )}
    </div>
  );
}
