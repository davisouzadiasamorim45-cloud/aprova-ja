"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { AuthState } from "@/lib/auth/actions";

type Props = {
  mode: "login" | "cadastro";
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
};

export function AuthForm({ mode, action }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const isLogin = mode === "login";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {!isLogin && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="full_name" className="text-sm font-medium text-slate-700">
            Nome completo
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            autoComplete="name"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            placeholder="Seu nome"
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          placeholder="voce@email.com"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-slate-700">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete={isLogin ? "current-password" : "new-password"}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          placeholder="••••••••"
        />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
      >
        {pending ? "Aguarde..." : isLogin ? "Entrar" : "Criar conta"}
      </button>

      <p className="text-center text-sm text-slate-500">
        {isLogin ? (
          <>
            Ainda não tem conta?{" "}
            <Link href="/cadastro" className="font-medium text-indigo-600 hover:underline">
              Cadastre-se grátis
            </Link>
          </>
        ) : (
          <>
            Já tem conta?{" "}
            <Link href="/login" className="font-medium text-indigo-600 hover:underline">
              Entrar
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
