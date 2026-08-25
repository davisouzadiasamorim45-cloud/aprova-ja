import { AuthForm } from "@/components/auth-form";
import { signUpAction } from "@/lib/auth/actions";

export default function CadastroPage() {
  return (
    <>
      <h1 className="mb-6 text-lg font-semibold text-slate-900">Criar sua conta grátis</h1>
      <AuthForm mode="cadastro" action={signUpAction} />
    </>
  );
}
