import { createClient } from "@/lib/supabase/server";
import { PlanosCliente } from "@/components/planos-cliente";

const PLANOS = [
  {
    id: "free" as const,
    nome: "Grátis",
    preco: "R$ 0",
    descricao: "Para começar a organizar seus estudos.",
    recursos: ["1 concurso ativo", "Banco de questões (uso limitado)", "Cronograma de estudos", "Até 1 baralho de flashcards"],
  },
  {
    id: "pro" as const,
    nome: "Pro",
    preco: "R$ 24,90/mês",
    descricao: "Para quem estuda todos os dias.",
    recursos: ["Concursos ilimitados", "Banco de questões completo + estatísticas", "Flashcards ilimitados", "Suporte prioritário"],
  },
  {
    id: "premium" as const,
    nome: "Premium",
    preco: "R$ 47/mês",
    descricao: "Para quem quer o máximo de desempenho.",
    recursos: ["Tudo do Pro", "Relatórios avançados de desempenho", "Simulados cronometrados", "Conteúdo exclusivo por banca"],
  },
];

export default async function PlanosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: assinatura } = await supabase
    .from("assinaturas")
    .select("plano, status, periodo_atual_fim")
    .eq("user_id", user!.id)
    .maybeSingle();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Plano e assinatura</h1>
      <p className="mt-1 text-sm text-slate-500">
        Plano atual: <span className="font-semibold capitalize text-slate-700">{assinatura?.plano ?? "free"}</span>
        {assinatura?.status === "active" && " · assinatura ativa"}
      </p>

      <PlanosCliente planos={PLANOS} planoAtual={assinatura?.plano ?? "free"} temAssinatura={!!assinatura?.status && assinatura.status !== "inactive"} />

      <p className="mt-8 text-xs text-slate-400">
        Integração de cobrança via Stripe. Para ativar pagamentos reais, configure as chaves do Stripe e os
        Price IDs dos planos Pro/Premium nas variáveis de ambiente (veja o README).
      </p>
    </div>
  );
}
