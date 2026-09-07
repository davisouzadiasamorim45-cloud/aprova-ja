export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alternativas: {
        Row: {
          correta: boolean
          id: string
          letra: string
          ordem: number
          questao_id: string
          texto: string
        }
        Insert: {
          correta?: boolean
          id?: string
          letra: string
          ordem?: number
          questao_id: string
          texto: string
        }
        Update: {
          correta?: boolean
          id?: string
          letra?: string
          ordem?: number
          questao_id?: string
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "alternativas_questao_id_fkey"
            columns: ["questao_id"]
            isOneToOne: false
            referencedRelation: "questoes"
            referencedColumns: ["id"]
          },
        ]
      }
      assinaturas: {
        Row: {
          created_at: string
          id: string
          periodo_atual_fim: string | null
          plano: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          periodo_atual_fim?: string | null
          plano?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          periodo_atual_fim?: string | null
          plano?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assinaturas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      baralhos: {
        Row: {
          concurso_id: string | null
          created_at: string
          id: string
          nome: string
          user_id: string
        }
        Insert: {
          concurso_id?: string | null
          created_at?: string
          id?: string
          nome: string
          user_id: string
        }
        Update: {
          concurso_id?: string | null
          created_at?: string
          id?: string
          nome?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "baralhos_concurso_id_fkey"
            columns: ["concurso_id"]
            isOneToOne: false
            referencedRelation: "concursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "baralhos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      concursos: {
        Row: {
          ano: number | null
          banca: string | null
          created_at: string
          created_by: string | null
          descricao: string | null
          edital_url: string | null
          estado: string | null
          id: string
          nivel: string | null
          nome: string
          orgao: string | null
          status: string
        }
        Insert: {
          ano?: number | null
          banca?: string | null
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          edital_url?: string | null
          estado?: string | null
          id?: string
          nivel?: string | null
          nome: string
          orgao?: string | null
          status?: string
        }
        Update: {
          ano?: number | null
          banca?: string | null
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          edital_url?: string | null
          estado?: string | null
          id?: string
          nivel?: string | null
          nome?: string
          orgao?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "concursos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cronograma_itens: {
        Row: {
          concluido: boolean
          concurso_id: string | null
          created_at: string
          data: string | null
          dia_semana: number | null
          duracao_minutos: number
          id: string
          materia_id: string | null
          titulo: string
          topico_id: string | null
          user_id: string
        }
        Insert: {
          concluido?: boolean
          concurso_id?: string | null
          created_at?: string
          data?: string | null
          dia_semana?: number | null
          duracao_minutos?: number
          id?: string
          materia_id?: string | null
          titulo: string
          topico_id?: string | null
          user_id: string
        }
        Update: {
          concluido?: boolean
          concurso_id?: string | null
          created_at?: string
          data?: string | null
          dia_semana?: number | null
          duracao_minutos?: number
          id?: string
          materia_id?: string | null
          titulo?: string
          topico_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cronograma_itens_concurso_id_fkey"
            columns: ["concurso_id"]
            isOneToOne: false
            referencedRelation: "concursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronograma_itens_materia_id_fkey"
            columns: ["materia_id"]
            isOneToOne: false
            referencedRelation: "materias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronograma_itens_topico_id_fkey"
            columns: ["topico_id"]
            isOneToOne: false
            referencedRelation: "topicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronograma_itens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcard_revisoes: {
        Row: {
          created_at: string
          flashcard_id: string
          id: string
          qualidade: number
          user_id: string
        }
        Insert: {
          created_at?: string
          flashcard_id: string
          id?: string
          qualidade: number
          user_id: string
        }
        Update: {
          created_at?: string
          flashcard_id?: string
          id?: string
          qualidade?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_revisoes_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcard_revisoes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcards: {
        Row: {
          baralho_id: string
          created_at: string
          fator_facilidade: number
          frente: string
          id: string
          intervalo_dias: number
          proxima_revisao: string
          questao_id: string | null
          repeticoes: number
          user_id: string
          verso: string
        }
        Insert: {
          baralho_id: string
          created_at?: string
          fator_facilidade?: number
          frente: string
          id?: string
          intervalo_dias?: number
          proxima_revisao?: string
          questao_id?: string | null
          repeticoes?: number
          user_id: string
          verso: string
        }
        Update: {
          baralho_id?: string
          created_at?: string
          fator_facilidade?: number
          frente?: string
          id?: string
          intervalo_dias?: number
          proxima_revisao?: string
          questao_id?: string | null
          repeticoes?: number
          user_id?: string
          verso?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_baralho_id_fkey"
            columns: ["baralho_id"]
            isOneToOne: false
            referencedRelation: "baralhos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcards_questao_id_fkey"
            columns: ["questao_id"]
            isOneToOne: false
            referencedRelation: "questoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      materias: {
        Row: {
          concurso_id: string
          created_at: string
          id: string
          nome: string
          ordem: number
        }
        Insert: {
          concurso_id: string
          created_at?: string
          id?: string
          nome: string
          ordem?: number
        }
        Update: {
          concurso_id?: string
          created_at?: string
          id?: string
          nome?: string
          ordem?: number
        }
        Relationships: [
          {
            foreignKeyName: "materias_concurso_id_fkey"
            columns: ["concurso_id"]
            isOneToOne: false
            referencedRelation: "concursos"
            referencedColumns: ["id"]
          },
        ]
      }
      metas_concurso: {
        Row: {
          concurso_id: string
          created_at: string
          data_prova: string | null
          horas_semanais_meta: number | null
          id: string
          user_id: string
        }
        Insert: {
          concurso_id: string
          created_at?: string
          data_prova?: string | null
          horas_semanais_meta?: number | null
          id?: string
          user_id: string
        }
        Update: {
          concurso_id?: string
          created_at?: string
          data_prova?: string | null
          horas_semanais_meta?: number | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "metas_concurso_concurso_id_fkey"
            columns: ["concurso_id"]
            isOneToOne: false
            referencedRelation: "concursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metas_concurso_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          estado: string | null
          full_name: string | null
          id: string
          plan: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          estado?: string | null
          full_name?: string | null
          id: string
          plan?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          estado?: string | null
          full_name?: string | null
          id?: string
          plan?: string
          updated_at?: string
        }
        Relationships: []
      }
      progresso_edital: {
        Row: {
          id: string
          status: string
          topico_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          status?: string
          topico_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          status?: string
          topico_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progresso_edital_topico_id_fkey"
            columns: ["topico_id"]
            isOneToOne: false
            referencedRelation: "topicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progresso_edital_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      questoes: {
        Row: {
          ano: number | null
          banca: string | null
          concurso_id: string | null
          created_at: string
          created_by: string | null
          dificuldade: string
          enunciado: string
          explicacao: string | null
          id: string
          materia_id: string | null
          tipo: string
          topico_id: string | null
        }
        Insert: {
          ano?: number | null
          banca?: string | null
          concurso_id?: string | null
          created_at?: string
          created_by?: string | null
          dificuldade?: string
          enunciado: string
          explicacao?: string | null
          id?: string
          materia_id?: string | null
          tipo?: string
          topico_id?: string | null
        }
        Update: {
          ano?: number | null
          banca?: string | null
          concurso_id?: string | null
          created_at?: string
          created_by?: string | null
          dificuldade?: string
          enunciado?: string
          explicacao?: string | null
          id?: string
          materia_id?: string | null
          tipo?: string
          topico_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questoes_concurso_id_fkey"
            columns: ["concurso_id"]
            isOneToOne: false
            referencedRelation: "concursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questoes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questoes_materia_id_fkey"
            columns: ["materia_id"]
            isOneToOne: false
            referencedRelation: "materias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questoes_topico_id_fkey"
            columns: ["topico_id"]
            isOneToOne: false
            referencedRelation: "topicos"
            referencedColumns: ["id"]
          },
        ]
      }
      tentativas: {
        Row: {
          alternativa_id: string | null
          correta: boolean
          created_at: string
          id: string
          questao_id: string
          tempo_resposta_segundos: number | null
          user_id: string
        }
        Insert: {
          alternativa_id?: string | null
          correta: boolean
          created_at?: string
          id?: string
          questao_id: string
          tempo_resposta_segundos?: number | null
          user_id: string
        }
        Update: {
          alternativa_id?: string | null
          correta?: boolean
          created_at?: string
          id?: string
          questao_id?: string
          tempo_resposta_segundos?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tentativas_alternativa_id_fkey"
            columns: ["alternativa_id"]
            isOneToOne: false
            referencedRelation: "alternativas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tentativas_questao_id_fkey"
            columns: ["questao_id"]
            isOneToOne: false
            referencedRelation: "questoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tentativas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      topicos: {
        Row: {
          created_at: string
          id: string
          materia_id: string
          nome: string
          ordem: number
        }
        Insert: {
          created_at?: string
          id?: string
          materia_id: string
          nome: string
          ordem?: number
        }
        Update: {
          created_at?: string
          id?: string
          materia_id?: string
          nome?: string
          ordem?: number
        }
        Relationships: [
          {
            foreignKeyName: "topicos_materia_id_fkey"
            columns: ["materia_id"]
            isOneToOne: false
            referencedRelation: "materias"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      gerar_flashcards_de_erros: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
