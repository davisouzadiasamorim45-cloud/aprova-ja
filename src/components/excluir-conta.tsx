"use client";

import { useActionState, useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { excluirContaAction, type ExcluirContaState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";

const PALAVRA_CONFIRMACAO = "EXCLUIR";

export function ExcluirConta() {
  const [aberto, setAberto] = useState(false);
  const [confirmacao, setConfirmacao] = useState("");
  const [state, formAction, pending] = useActionState<ExcluirContaState, FormData>(excluirContaAction, undefined);

  useEffect(() => {
    if (state?.error) toast.erro(state.error);
  }, [state]);

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-red-200 p-5 dark:border-red-900">
        <div>
          <p className="text-sm font-medium text-red-700 dark:text-red-300">Excluir conta</p>
          <p className="mt-0.5 max-w-md text-xs text-ink-500">
            Apaga permanentemente seu perfil, questões respondidas, flashcards e cronograma, e cancela sua assinatura,
            se houver. Não tem volta.
          </p>
        </div>
        <Button type="button" variant="danger" size="sm" onClick={() => setAberto(true)}>
          Excluir conta
        </Button>
      </div>

      {aberto && (
        <div
          role="presentation"
          onClick={() => !pending && setAberto(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div
            role="alertdialog"
            aria-labelledby="titulo-excluir-conta"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm animate-fade-up rounded-2xl border border-red-300 bg-surface p-6 shadow-soft-lg dark:border-red-900"
          >
            <AlertTriangle className="h-8 w-8 text-red-600" strokeWidth={1.75} />
            <h2 id="titulo-excluir-conta" className="mt-3 font-display text-lg font-semibold text-ink-900">
              Excluir sua conta?
            </h2>
            <p className="mt-1.5 text-sm text-ink-600">
              Isso apaga sua conta e todos os seus dados — questões respondidas, flashcards, cronograma e assinatura
              (se houver). Não é possível desfazer.
            </p>

            <form action={formAction} className="mt-4">
              <Label htmlFor="confirmacao">
                Digite <span className="font-semibold text-red-600">{PALAVRA_CONFIRMACAO}</span> para confirmar
              </Label>
              <Input
                id="confirmacao"
                name="confirmacao"
                autoComplete="off"
                autoFocus
                value={confirmacao}
                onChange={(e) => setConfirmacao(e.target.value)}
              />
              <div className="mt-4 flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setAberto(false)} disabled={pending}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  size="sm"
                  disabled={pending || confirmacao.trim().toUpperCase() !== PALAVRA_CONFIRMACAO}
                >
                  {pending ? "Excluindo..." : "Excluir permanentemente"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
