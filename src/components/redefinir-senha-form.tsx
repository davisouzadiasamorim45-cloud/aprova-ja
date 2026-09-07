"use client";

import { useActionState, useEffect } from "react";
import { redefinirSenhaAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";

export function RedefinirSenhaForm() {
  const [state, formAction, pending] = useActionState(redefinirSenhaAction, undefined);

  useEffect(() => {
    if (state?.error) toast.erro(state.error);
  }, [state]);

  return (
    <div>
      <h1 className="font-display text-xl font-semibold text-ink-900">Criar nova senha</h1>
      <p className="mt-1 text-sm text-ink-500">Escolha uma senha nova para sua conta.</p>

      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <div>
          <Label htmlFor="password">Nova senha</Label>
          <Input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" placeholder="••••••••" />
        </div>
        <div>
          <Label htmlFor="password_confirm">Confirme a senha</Label>
          <Input id="password_confirm" name="password_confirm" type="password" required minLength={6} autoComplete="new-password" placeholder="••••••••" />
        </div>

        <Button type="submit" disabled={pending} className="mt-1">
          {pending ? "Salvando..." : "Salvar nova senha"}
        </Button>
      </form>
    </div>
  );
}
