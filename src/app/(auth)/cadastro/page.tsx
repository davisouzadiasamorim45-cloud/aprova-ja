import { AuthForm } from "@/components/auth-form";
import { signUpAction } from "@/lib/auth/actions";

export default function CadastroPage() {
  return <AuthForm mode="cadastro" action={signUpAction} />;
}
