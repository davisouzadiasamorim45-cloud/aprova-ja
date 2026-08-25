"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Concurso = {
  id: string;
  nome: string;
  orgao: string | null;
  banca: string | null;
  ano: number | null;
  nivel: string | null;
  status: string;
};

const STATUS_LABEL: Record<string, string> = {
  previsto: "Previsto",
  edital_publicado: "Edital publicado",
  inscricoes_abertas: "Inscrições abertas",
  encerrado: "Encerrado",
};

export function CatalogoConcursos({ concursos, idsSeguidos }: { concursos: Concurso[]; idsSeguidos: Set<string> }) {
  const supabase = useMemo(() => createClient(), []);
  const [seguindo, setSeguindo] = useState<Set<string>>(idsSeguidos);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nome, setNome] = useState("");
  const [orgao, setOrgao] = useState("");
  const [banca, setBanca] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function seguir(concursoId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("metas_concurso").upsert(
      { user_id: user.id, concurso_id: concursoId },
      { onConflict: "user_id,concurso_id" }
    );
    setSeguindo((prev) => new Set(prev).add(concursoId));
  }

  async function cadastrarConcurso(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;
    setSalvando(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("concursos").insert({
      nome: nome.trim(),
      orgao: orgao.trim() || null,
      banca: banca.trim() || null,
      status: "previsto",
      created_by: user.id,
    });

    if (!error) {
      setNome("");
      setOrgao("");
      setBanca("");
      setMostrarForm(false);
      window.location.reload();
    }
    setSalvando(false);
  }

  return (
    <div>
      <button
        onClick={() => setMostrarForm((v) => !v)}
        className="mb-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        {mostrarForm ? "Cancelar" : "+ Cadastrar novo concurso"}
      </button>

      {mostrarForm && (
        <form onSubmit={cadastrarConcurso} className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-3">
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome do concurso"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-3"
          />
          <input
            value={orgao}
            onChange={(e) => setOrgao(e.target.value)}
            placeholder="Órgão (opcional)"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            value={banca}
            onChange={(e) => setBanca(e.target.value)}
            placeholder="Banca (opcional)"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={salvando}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            Salvar
          </button>
        </form>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {concursos.map((c) => (
          <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">{c.nome}</p>
                <p className="mt-0.5 text-sm text-slate-500">
                  {[c.orgao, c.banca, c.ano].filter(Boolean).join(" · ") || "Sem detalhes"}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                {STATUS_LABEL[c.status] ?? c.status}
              </span>
            </div>
            <button
              onClick={() => seguir(c.id)}
              disabled={seguindo.has(c.id)}
              className={`mt-4 rounded-lg px-4 py-2 text-sm font-semibold ${
                seguindo.has(c.id) ? "bg-emerald-50 text-emerald-700" : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {seguindo.has(c.id) ? "✓ Você está seguindo" : "Focar neste concurso"}
            </button>
          </div>
        ))}
        {concursos.length === 0 && <p className="text-sm text-slate-500">Nenhum concurso cadastrado ainda.</p>}
      </div>
    </div>
  );
}
