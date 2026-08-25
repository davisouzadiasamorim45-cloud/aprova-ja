import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AprovaJá — Treino para concursos públicos",
  description: "Questões, flashcards com repetição espaçada e cronograma de estudos para concurseiros.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
