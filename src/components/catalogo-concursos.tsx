"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Landmark, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import { Card, CardForm } from "@/components/ui/card";
import { Button, buttonClass } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { ESTADOS, nomeEstado } from "@/lib/estados";

type Concurso = {
  id: string;
  nome: string;
  orgao: string | null;
  banca: string | null;
  ano: number | null;
  nivel: string | null;
  status: string;
  estado?: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  previsto: "Previsto",
  edital_publicado: "Edital publicado",
  inscricoes_abertas: "Inscrições abertas",
  encerrado: "Encerrado",
};

export function CatalogoConcursos({
  concursos,
  idsSeguidos,
  estadoUsuario,
}: {
  concursos: Concurso[];
  idsSeguidos: Set<string>;
  estadoUsuario?: string | null;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [seguindo, setSeguindo] = useState<Set<string>>(idsSeguidos);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nome, setNome] = useState("");
  const [orgao, setOrgao] = useState("");
  const [banca, setBanca] = useState("");
  const [estado, setEstado] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [somenteMeuEstado, setSomenteMeuEstado] = useState(Boolean(estadoUsuario));

  const concursosFiltrados = useMemo(
    () =>
      somenteMeuEstado && estadoUsuario
        ? // Nacionais + estado do usuário — mas nunca esconde um concurso que a
          // pessoa já segue, mesmo que seja de outro estado (senão ele "some"
          // da lista sempre que o filtro volta a ligar por padrão).
          concursos.filter((c) => !c.estado || c.estado === estadoUsuario || seguindo.has(c.id))
        : concursos,
    [concursos, somenteMeuEstado, estadoUsuario, seguindo]
  );

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
      estado: estado || null,
      status: "previsto",
      created_by: user.id,
    });

    if (!error) {
      setNome("");
      setOrgao("");
      setBanca("");
      setEstado("");
      setMostrarForm(false);
      window.location.reload();
    }
    setSalvando(false);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => setMostrarForm((v) => !v)} className={buttonClass("outline", "md", "gap-1.5")}>
          <Plus className="h-4 w-4" /> {mostrarForm ? "Cancelar" : "Cadastrar novo concurso"}
        </button>

        {estadoUsuario && (
          <div className="inline-flex rounded-full border border-ink-200 bg-white p-1 text-sm">
            <button
              onClick={() => setSomenteMeuEstado(true)}
              className={cn(
                "rounded-full px-3.5 py-1.5 font-medium transition-colors",
                somenteMeuEstado ? "bg-brand-600 text-white" : "text-ink-600 hover:bg-ink-100"
              )}
            >
              {nomeEstado(estadoUsuario)} + Nacionais
            </button>
            <button
              onClick={() => setSomenteMeuEstado(false)}
              className={cn(
                "rounded-full px-3.5 py-1.5 font-medium transition-colors",
                !somenteMeuEstado ? "bg-brand-600 text-white" : "text-ink-600 hover:bg-ink-100"
              )}
            >
              Todos os estados
            </button>
          </div>
        )}
      </div>

      {mostrarForm && (
        <CardForm onSubmit={cadastrarConcurso} className="mb-6 grid gap-3 p-5 sm:grid-cols-3">
          <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do concurso" className="sm:col-span-3" />
          <Input value={orgao} onChange={(e) => setOrgao(e.target.value)} placeholder="Órgão (opcional)" />
          <Input value={banca} onChange={(e) => setBanca(e.target.value)} placeholder="Banca (opcional)" />
          <Select value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">Nacional</option>
            {ESTADOS.map((e) => (
              <option key={e.uf} value={e.uf}>
                {e.nome}
              </option>
            ))}
          </Select>
          <Button type="submit" disabled={salvando} className="sm:col-span-3">
            Salvar
          </Button>
        </CardForm>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {concursosFiltrados.map((c) => {
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
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <Badge>{STATUS_LABEL[c.status] ?? c.status}</Badge>
                  <Badge tone={c.estado ? "gold" : "brand"}>{c.estado ?? "Nacional"}</Badge>
                </div>
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
        {concursosFiltrados.length === 0 && (
          <p className="text-sm text-ink-500">Nenhum concurso encontrado para esse filtro.</p>
        )}
      </div>
    </div>
  );
}
