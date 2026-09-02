export const PLANOS = [
  {
    id: "free" as const,
    nome: "Grátis",
    preco: "R$ 0",
    periodo: "",
    descricao: "Para começar a organizar seus estudos.",
    recursos: ["1 concurso ativo", "Banco de questões (uso limitado)", "Cronograma de estudos", "Até 1 baralho de flashcards"],
  },
  {
    id: "pro" as const,
    nome: "Pro",
    preco: "R$ 24,90",
    periodo: "/mês",
    descricao: "Para quem estuda todos os dias.",
    recursos: ["Concursos ilimitados", "Banco de questões completo + estatísticas", "Flashcards ilimitados", "Suporte prioritário"],
    recomendado: true,
  },
  {
    id: "premium" as const,
    nome: "Premium",
    preco: "R$ 47",
    periodo: "/mês",
    descricao: "Para quem quer o máximo de desempenho.",
    recursos: ["Tudo do Pro", "Relatórios avançados de desempenho", "Simulados cronometrados", "Conteúdo exclusivo por banca"],
  },
];
