"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { recuperarSenhaAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";

export function RecuperarSenhaForm() {
  const [state, formAction, pending] = useActionState(recuperarSenhaAction, undefined);

  useEffect(() => {
    if (state?.error) toast.erro(state.error);
  }, [state]);

  if (state?.sucesso) {
    return (
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-900">Verifique seu e-mail</h1>
        <p className="mt-2 text-sm text-ink-500">
          Se existir uma conta com esse e-mail, enviamos um link pra você criar uma senha nova. Confira também a caixa de spam.
        </p>
        <Link href="/login" className="mt-6 inline-block text-sm font-medium text-brand-700 hover:underline">
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-xl font-semibold text-ink-900">Recuperar senha</h1>
      <p className="mt-1 text-sm text-ink-500">Informe seu e-mail e enviaremos um link pra você criar uma senha nova.</p>

      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" placeholder="voce@email.com" />
        </div>

        <Button type="submit" disabled={pending} className="mt-1">
          {pending ? "Enviando..." : "Enviar link"}
        </Button>

        <p className="text-center text-sm text-ink-500">
          Lembrou a senha?{" "}
          <Link href="/login" className="font-medium text-brand-700 hover:underline">
            Voltar para o login
          </Link>
        </p>
      </form>
    </div>
  );
}
