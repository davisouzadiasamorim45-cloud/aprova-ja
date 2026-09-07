"use client";

import { useActionState, useEffect, useRef } from "react";
import { alterarEmailAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";

export function AlterarEmailForm({ emailAtual }: { emailAtual: string }) {
  const [state, formAction, pending] = useActionState(alterarEmailAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.error) toast.erro(state.error);
    if (state?.sucesso) formRef.current?.reset();
  }, [state]);

  if (state?.sucesso) {
    return (
      <p className="text-sm text-ink-600">
        Enviamos um link de confirmação pro seu e-mail atual (<strong>{emailAtual}</strong>) e pro novo endereço. Confirme
        nos dois pra efetivar a troca.
      </p>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <p className="text-xs text-ink-500">
        E-mail atual: <span className="font-medium text-ink-700">{emailAtual}</span>
      </p>
      <div>
        <Label htmlFor="novo_email">Novo e-mail</Label>
        <Input id="novo_email" name="novo_email" type="email" required autoComplete="email" placeholder="novo@email.com" />
      </div>
      <div>
        <Label htmlFor="senha_atual_email">Senha atual</Label>
        <Input id="senha_atual_email" name="senha_atual" type="password" required autoComplete="current-password" placeholder="••••••••" />
      </div>

      <Button type="submit" disabled={pending} variant="outline" size="sm" className="self-start">
        {pending ? "Enviando..." : "Alterar e-mail"}
      </Button>
    </form>
  );
}
