"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Landmark, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import { Card, CardForm } from "@/components/ui/card";
import { Button, buttonClass } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";

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
      <button onClick={() => setMostrarForm((v) => !v)} className={buttonClass("outline", "md", "mb-4 gap-1.5")}>
        <Plus className="h-4 w-4" /> {mostrarForm ? "Cancelar" : "Cadastrar novo concurso"}
      </button>

      {mostrarForm && (
        <CardForm onSubmit={cadastrarConcurso} className="mb-6 grid gap-3 p-5 sm:grid-cols-3">
          <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do concurso" className="sm:col-span-3" />
          <Input value={orgao} onChange={(e) => setOrgao(e.target.value)} placeholder="Órgão (opcional)" />
          <Input value={banca} onChange={(e) => setBanca(e.target.value)} placeholder="Banca (opcional)" />
          <Button type="submit" disabled={salvando}>
            Salvar
          </Button>
        </CardForm>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {concursos.map((c) => {
          const jaSegue = seguindo.has(c.id);
          return (
            <Card key={c.id} className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <Landmark className="h-4.5 w-4.5" strokeWidth={1.9} />
                  </div>
                  <div>
                    <p className="font-semibold text-ink-900">{c.nome}</p>
                    <p className="mt-0.5 text-sm text-ink-500">{[c.orgao, c.banca, c.ano].filter(Boolean).join(" · ") || "Sem detalhes"}</p>
                  </div>
                </div>
                <Badge className="shrink-0">{STATUS_LABEL[c.status] ?? c.status}</Badge>
              </div>
              <button
                onClick={() => seguir(c.id)}
                disabled={jaSegue}
                className={cn(
                  "mt-4 w-full rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
                  jaSegue ? "flex items-center justify-center gap-1.5 bg-brand-50 text-brand-700" : "bg-brand-600 text-white hover:bg-brand-700"
                )}
              >
                {jaSegue ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Você está seguindo
                  </>
                ) : (
                  "Focar neste concurso"
                )}
              </button>
            </Card>
          );
        })}
        {concursos.length === 0 && <p className="text-sm text-ink-500">Nenhum concurso cadastrado ainda.</p>}
      </div>
    </div>
  );
}
