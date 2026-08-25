// Tipos do banco de dados, escritos à mão a partir das migrations em
// supabase/migrations/. Quando o projeto Supabase estiver criado, prefira
// gerar este arquivo automaticamente com:
//   npx supabase gen types typescript --project-id <id> > src/types/database.ts

export type Plano = "free" | "pro" | "premium";
export type NivelConcurso = "fundamental" | "medio" | "superior";
export type StatusConcurso = "previsto" | "edital_publicado" | "inscricoes_abertas" | "encerrado";
export type StatusTopico = "nao_iniciado" | "estudando" | "revisando" | "concluido";
export type TipoQuestao = "multipla_escolha" | "certo_errado";
export type Dificuldade = "facil" | "media" | "dificil";
export type StatusAssinatura = "inactive" | "trialing" | "active" | "past_due" | "canceled";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          plan: Plano;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      concursos: {
        Row: {
          id: string;
          nome: string;
          orgao: string | null;
          banca: string | null;
          ano: number | null;
          nivel: NivelConcurso | null;
          status: StatusConcurso;
          descricao: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["concursos"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["concursos"]["Row"]>;
        Relationships: [];
      };
      materias: {
        Row: { id: string; concurso_id: string; nome: string; ordem: number; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["materias"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["materias"]["Row"]>;
        Relationships: [];
      };
      topicos: {
        Row: { id: string; materia_id: string; nome: string; ordem: number; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["topicos"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["topicos"]["Row"]>;
        Relationships: [];
      };
      progresso_edital: {
        Row: {
          id: string;
          user_id: string;
          topico_id: string;
          status: StatusTopico;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["progresso_edital"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["progresso_edital"]["Row"]>;
        Relationships: [];
      };
      questoes: {
        Row: {
          id: string;
          concurso_id: string | null;
          materia_id: string | null;
          topico_id: string | null;
          banca: string | null;
          ano: number | null;
          enunciado: string;
          tipo: TipoQuestao;
          dificuldade: Dificuldade;
          explicacao: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["questoes"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["questoes"]["Row"]>;
        Relationships: [];
      };
      alternativas: {
        Row: {
          id: string;
          questao_id: string;
          letra: string;
          texto: string;
          correta: boolean;
          ordem: number;
        };
        Insert: Partial<Database["public"]["Tables"]["alternativas"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["alternativas"]["Row"]>;
        Relationships: [];
      };
      tentativas: {
        Row: {
          id: string;
          user_id: string;
          questao_id: string;
          alternativa_id: string | null;
          correta: boolean;
          tempo_resposta_segundos: number | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["tentativas"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["tentativas"]["Row"]>;
        Relationships: [];
      };
      metas_concurso: {
        Row: {
          id: string;
          user_id: string;
          concurso_id: string;
          data_prova: string | null;
          horas_semanais_meta: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["metas_concurso"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["metas_concurso"]["Row"]>;
        Relationships: [];
      };
      cronograma_itens: {
        Row: {
          id: string;
          user_id: string;
          concurso_id: string | null;
          materia_id: string | null;
          topico_id: string | null;
          titulo: string;
          dia_semana: number | null;
          data: string | null;
          duracao_minutos: number;
          concluido: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["cronograma_itens"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["cronograma_itens"]["Row"]>;
        Relationships: [];
      };
      baralhos: {
        Row: {
          id: string;
          user_id: string;
          concurso_id: string | null;
          nome: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["baralhos"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["baralhos"]["Row"]>;
        Relationships: [];
      };
      flashcards: {
        Row: {
          id: string;
          baralho_id: string;
          user_id: string;
          frente: string;
          verso: string;
          intervalo_dias: number;
          fator_facilidade: number;
          repeticoes: number;
          proxima_revisao: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["flashcards"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["flashcards"]["Row"]>;
        Relationships: [];
      };
      flashcard_revisoes: {
        Row: {
          id: string;
          flashcard_id: string;
          user_id: string;
          qualidade: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["flashcard_revisoes"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["flashcard_revisoes"]["Row"]>;
        Relationships: [];
      };
      assinaturas: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          plano: Plano;
          status: StatusAssinatura;
          periodo_atual_fim: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["assinaturas"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["assinaturas"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
