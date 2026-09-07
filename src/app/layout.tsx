import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz", "SOFT"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AprovaJá — Treino para concursos públicos",
  description: "Questões, flashcards com repetição espaçada e cronograma de estudos para concurseiros.",
};

// Aplica o tema (claro/escuro/sépia) antes da primeira pintura da página, pra
// não piscar claro-e-depois-escuro em quem já escolheu escuro (ou cujo
// sistema prefere escuro). Roda de novo em cada navegação porque trocar de
// tema só muda o atributo no <html> atual, não persiste isso entre
// carregamentos de página completos — só via localStorage, que este script
// lê. "sépia" nunca vem do sistema operacional (não existe essa preferência),
// só de uma escolha explícita salva.
const SCRIPT_TEMA = `
  (function () {
    try {
      var salvo = localStorage.getItem("theme");
      var tema = salvo === "light" || salvo === "dark" || salvo === "sepia"
        ? salvo
        : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", tema);
    } catch (e) {}
  })();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`h-full antialiased ${fraunces.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
