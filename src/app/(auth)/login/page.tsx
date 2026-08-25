import { AuthForm } from "@/components/auth-form";
import { signInAction } from "@/lib/auth/actions";

export default function LoginPage() {
  return (
    <>
      <h1 className="mb-6 text-lg font-semibold text-slate-900">Entrar na sua conta</h1>
      <AuthForm mode="login" action={signInAction} />
    </>
  );
}
