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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      ai_generations: {
        Row: {
          created_at: string | null
          error_message: string | null
          generated_content: Json
          id: string
          model_id: string | null
          presentation_id: string | null
          prompt_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          generated_content: Json
          id?: string
          model_id?: string | null
          presentation_id?: string | null
          prompt_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          generated_content?: Json
          id?: string
          model_id?: string | null
          presentation_id?: string | null
          prompt_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_generations_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_generations_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "ai_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_models: {
        Row: {
          created_at: string | null
          display_name: string
          id: string
          is_active: boolean | null
          model_name: string
          provider: string
        }
        Insert: {
          created_at?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          model_name: string
          provider: string
        }
        Update: {
          created_at?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          model_name?: string
          provider?: string
        }
        Relationships: []
      }
      ai_prompts: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          prompt_text: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          prompt_text: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          prompt_text?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ai_versions: {
        Row: {
          content: Json
          created_at: string | null
          generation_id: string | null
          id: string
          version_number: number
        }
        Insert: {
          content: Json
          created_at?: string | null
          generation_id?: string | null
          id?: string
          version_number: number
        }
        Update: {
          content?: Json
          created_at?: string | null
          generation_id?: string | null
          id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "ai_versions_generation_id_fkey"
            columns: ["generation_id"]
            isOneToOne: false
            referencedRelation: "ai_generations"
            referencedColumns: ["id"]
          },
        ]
      }
      camera_bookmarks: {
        Row: {
          created_at: string | null
          id: string
          name: string
          rotation: number | null
          target_frame_id: string | null
          x: number
          y: number
          zoom: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          rotation?: number | null
          target_frame_id?: string | null
          x: number
          y: number
          zoom: number
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          rotation?: number | null
          target_frame_id?: string | null
          x?: number
          y?: number
          zoom?: number
        }
        Relationships: []
      }
      camera_keyframes: {
        Row: {
          animation_preset:
            | Database["public"]["Enums"]["animation_preset"]
            | null
          created_at: string | null
          frame_id: string
          id: string
          is_skipped: boolean | null
          notes: string | null
          order_index: number
          path_id: string
          stay_duration: number | null
          transition_duration: number | null
          transition_type:
            | Database["public"]["Enums"]["transition_effect"]
            | null
        }
        Insert: {
          animation_preset?:
            | Database["public"]["Enums"]["animation_preset"]
            | null
          created_at?: string | null
          frame_id: string
          id?: string
          is_skipped?: boolean | null
          notes?: string | null
          order_index: number
          path_id: string
          stay_duration?: number | null
          transition_duration?: number | null
          transition_type?:
            | Database["public"]["Enums"]["transition_effect"]
            | null
        }
        Update: {
          animation_preset?:
            | Database["public"]["Enums"]["animation_preset"]
            | null
          created_at?: string | null
          frame_id?: string
          id?: string
          is_skipped?: boolean | null
          notes?: string | null
          order_index?: number
          path_id?: string
          stay_duration?: number | null
          transition_duration?: number | null
          transition_type?:
            | Database["public"]["Enums"]["transition_effect"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "camera_keyframes_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "camera_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      camera_paths: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_looping: boolean | null
          is_reverse: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_looping?: boolean | null
          is_reverse?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_looping?: boolean | null
          is_reverse?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      presentation_sessions: {
        Row: {
          completed_frames: number | null
          ended_at: string | null
          id: string
          path_id: string | null
          started_at: string | null
          total_frames: number | null
        }
        Insert: {
          completed_frames?: number | null
          ended_at?: string | null
          id?: string
          path_id?: string | null
          started_at?: string | null
          total_frames?: number | null
        }
        Update: {
          completed_frames?: number | null
          ended_at?: string | null
          id?: string
          path_id?: string | null
          started_at?: string | null
          total_frames?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "presentation_sessions_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "camera_paths"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      animation_preset:
        | "smooth"
        | "ease-in"
        | "ease-out"
        | "ease-in-out"
        | "bounce"
        | "elastic"
        | "fast"
        | "slow"
        | "cinematic"
      transition_effect:
        | "zoom"
        | "fade"
        | "cross-fade"
        | "slide"
        | "rotate"
        | "scale"
        | "morph"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      animation_preset: [
        "smooth",
        "ease-in",
        "ease-out",
        "ease-in-out",
        "bounce",
        "elastic",
        "fast",
        "slow",
        "cinematic",
      ],
      transition_effect: [
        "zoom",
        "fade",
        "cross-fade",
        "slide",
        "rotate",
        "scale",
        "morph",
      ],
    },
  },
} as const
