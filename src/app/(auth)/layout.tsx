import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background bg-grain px-4 py-10">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex">
            <Logo />
          </Link>
          <p className="mt-2 text-sm text-ink-500">Sua preparação para concursos, organizada.</p>
        </div>
        <div className="rounded-2xl border border-ink-200/70 bg-white p-7 shadow-soft-lg">{children}</div>
      </div>
    </div>
  );
}
