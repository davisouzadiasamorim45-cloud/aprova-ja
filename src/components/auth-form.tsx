"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import type { AuthState } from "@/lib/auth/actions";
import { reenviarConfirmacaoAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { ESTADOS } from "@/lib/estados";

type Props = {
  mode: "login" | "cadastro";
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
};

export function AuthForm({ mode, action }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const isLogin = mode === "login";

  // A action devolve um objeto novo a cada envio, então o mesmo erro repetido
  // (senha errada duas vezes seguidas) volta a aparecer.
  useEffect(() => {
    if (state?.error) toast.erro(state.error);
  }, [state]);

  if (state?.confirmacaoPendente) {
    return <ConfirmacaoPendente email={state.confirmacaoPendente} />;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">
        {isLogin ? "Bem-vindo de volta" : "Criar sua conta grátis"}
      </h1>
      <p className="mt-1.5 text-sm text-ink-500">
        {isLogin ? "Entre pra continuar de onde parou." : "Leva menos de um minuto."}
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
          {isLogin && (
            <div className="mt-1.5 text-right">
              <Link href="/recuperar-senha" className="text-xs font-medium text-brand-700 hover:underline">
                Esqueceu a senha?
              </Link>
            </div>
          )}
        </div>

        {!isLogin && (
          <div>
            <Label htmlFor="estado">Seu estado</Label>
            <Select id="estado" name="estado" required defaultValue="" autoComplete="address-level1">
              <option value="" disabled>
                Selecione...
              </option>
              {ESTADOS.map((e) => (
                <option key={e.uf} value={e.uf}>
                  {e.nome}
                </option>
              ))}
            </Select>
            <p className="mt-1.5 text-xs text-ink-400">Usamos isso pra te mostrar concursos estaduais do seu estado, além dos nacionais.</p>
          </div>
        )}

        {!isLogin && (
          <p className="text-xs leading-relaxed text-ink-400">
            Você vai receber um e-mail pra confirmar a conta antes de entrar.
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

/** Mostrada depois do cadastro (ou de tentar entrar com conta não confirmada). */
function ConfirmacaoPendente({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(reenviarConfirmacaoAction, undefined);

  useEffect(() => {
    if (state?.error) toast.erro(state.error);
    if (state?.sucesso) {
      toast.sucesso("Link reenviado", { descricao: "Confira sua caixa de entrada — e o spam." });
    }
  }, [state]);

  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
        <MailCheck className="h-6 w-6" strokeWidth={1.9} />
      </div>
      <h1 className="mt-4 font-display text-2xl font-semibold text-ink-900">Confirme seu e-mail</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">
        Enviamos um link de confirmação para <span className="font-medium text-ink-800">{email}</span>. Clique nele
        para ativar a conta e continuar.
      </p>
      <p className="mt-1.5 text-xs text-ink-400">Não esqueça de olhar a caixa de spam.</p>

      <form action={formAction} className="mt-6">
        <input type="hidden" name="email" value={email} />
        <Button type="submit" variant="outline" disabled={pending} className="w-full justify-center">
          {pending ? "Reenviando..." : "Reenviar e-mail"}
        </Button>
      </form>

      <Link href="/login" className="mt-4 inline-block text-sm font-medium text-brand-700 hover:underline">
        Voltar para o login
      </Link>
    </div>
  );
}
