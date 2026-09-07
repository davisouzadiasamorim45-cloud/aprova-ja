"use client";

import { useActionState, useEffect, useRef } from "react";
import { alterarSenhaAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";

export function AlterarSenhaForm() {
  const [state, formAction, pending] = useActionState(alterarSenhaAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.error) toast.erro(state.error);
    if (state?.sucesso) {
      toast.sucesso("Senha alterada com sucesso.");
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="senha_atual">Senha atual</Label>
        <Input id="senha_atual" name="senha_atual" type="password" required autoComplete="current-password" placeholder="••••••••" />
      </div>
      <div>
        <Label htmlFor="nova_senha">Nova senha</Label>
        <Input id="nova_senha" name="nova_senha" type="password" required minLength={6} autoComplete="new-password" placeholder="••••••••" />
      </div>
      <div>
        <Label htmlFor="nova_senha_confirm">Confirme a nova senha</Label>
        <Input
          id="nova_senha_confirm"
          name="nova_senha_confirm"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="••••••••"
        />
      </div>

      <Button type="submit" disabled={pending} variant="outline" size="sm" className="self-start">
        {pending ? "Salvando..." : "Alterar senha"}
      </Button>
    </form>
  );
}
