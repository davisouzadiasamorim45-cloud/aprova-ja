"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import type { AuthState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

type Props = {
  mode: "login" | "cadastro";
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
};

export function AuthForm({ mode, action }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const isLogin = mode === "login";

  return (
    <div>
      <h1 className="font-display text-xl font-semibold text-ink-900">
        {isLogin ? "Entrar na sua conta" : "Criar sua conta grátis"}
      </h1>
      <p className="mt-1 text-sm text-ink-500">
        {isLogin ? "Continue de onde parou." : "Leva menos de um minuto."}
      </p>

      <form action={formAction} className="mt-6 flex flex-col gap-4">
        {!isLogin && (
          <div>
            <Label htmlFor="full_name">Nome completo</Label>
            <Input id="full_name" name="full_name" type="text" required autoComplete="name" placeholder="Seu nome" />
          </div>
        )}

        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" placeholder="voce@email.com" />
        </div>

        <div>
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={isLogin ? "current-password" : "new-password"}
            placeholder="••••••••"
          />
        </div>

        {state?.error && (
          <p className="flex items-start gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {state.error}
          </p>
        )}

        <Button type="submit" disabled={pending} className="mt-1">
          {pending ? "Aguarde..." : isLogin ? "Entrar" : "Criar conta"}
        </Button>

        <p className="text-center text-sm text-ink-500">
          {isLogin ? (
            <>
              Ainda não tem conta?{" "}
              <Link href="/cadastro" className="font-medium text-brand-700 hover:underline">
                Cadastre-se grátis
              </Link>
            </>
          ) : (
            <>
              Já tem conta?{" "}
              <Link href="/login" className="font-medium text-brand-700 hover:underline">
                Entrar
              </Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
