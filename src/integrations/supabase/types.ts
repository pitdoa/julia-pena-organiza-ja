export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      calendar_events: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          event_date: string
          event_time: string | null
          id: string
          is_all_day: boolean | null
          title: string
          type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          event_date: string
          event_time?: string | null
          id?: string
          is_all_day?: boolean | null
          title: string
          type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          event_date?: string
          event_time?: string | null
          id?: string
          is_all_day?: boolean | null
          title?: string
          type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_habits: {
        Row: {
          agua_gotas: number | null
          created_at: string
          date: string
          estudou: boolean | null
          gratidao: string | null
          hora_acordou: string | null
          humor: string | null
          id: string
          leu_biblia: boolean | null
          qualidade_sono: string | null
          reflexao: string | null
          rezou: boolean | null
          tomou_creatina: boolean | null
          tomou_whey: boolean | null
          treinou: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agua_gotas?: number | null
          created_at?: string
          date: string
          estudou?: boolean | null
          gratidao?: string | null
          hora_acordou?: string | null
          humor?: string | null
          id?: string
          leu_biblia?: boolean | null
          qualidade_sono?: string | null
          reflexao?: string | null
          rezou?: boolean | null
          tomou_creatina?: boolean | null
          tomou_whey?: boolean | null
          treinou?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agua_gotas?: number | null
          created_at?: string
          date?: string
          estudou?: boolean | null
          gratidao?: string | null
          hora_acordou?: string | null
          humor?: string | null
          id?: string
          leu_biblia?: boolean | null
          qualidade_sono?: string | null
          reflexao?: string | null
          rezou?: boolean | null
          tomou_creatina?: boolean | null
          tomou_whey?: boolean | null
          treinou?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      juju_conversations: {
        Row: {
          context_type: string | null
          created_at: string
          id: string
          keywords: string[] | null
          message: string
          response: string
          user_id: string
        }
        Insert: {
          context_type?: string | null
          created_at?: string
          id?: string
          keywords?: string[] | null
          message: string
          response: string
          user_id: string
        }
        Update: {
          context_type?: string | null
          created_at?: string
          id?: string
          keywords?: string[] | null
          message?: string
          response?: string
          user_id?: string
        }
        Relationships: []
      }
      juju_messages: {
        Row: {
          context_type: string | null
          created_at: string
          hour_range: string | null
          id: string
          is_active: boolean | null
          message: string
        }
        Insert: {
          context_type?: string | null
          created_at?: string
          hour_range?: string | null
          id?: string
          is_active?: boolean | null
          message: string
        }
        Update: {
          context_type?: string | null
          created_at?: string
          hour_range?: string | null
          id?: string
          is_active?: boolean | null
          message?: string
        }
        Relationships: []
      }
      kanban_tasks: {
        Row: {
          category: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_template: boolean | null
          priority: number | null
          repeat_frequency: string | null
          repeats: boolean | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_template?: boolean | null
          priority?: number | null
          repeat_frequency?: string | null
          repeats?: boolean | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_template?: boolean | null
          priority?: number | null
          repeat_frequency?: string | null
          repeats?: boolean | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pomodoro_sessions: {
        Row: {
          break_duration_minutes: number
          completed: boolean | null
          completed_at: string | null
          duration_minutes: number
          id: string
          started_at: string
          task_description: string | null
          user_id: string
        }
        Insert: {
          break_duration_minutes?: number
          completed?: boolean | null
          completed_at?: string | null
          duration_minutes?: number
          id?: string
          started_at?: string
          task_description?: string | null
          user_id: string
        }
        Update: {
          break_duration_minutes?: number
          completed?: boolean | null
          completed_at?: string | null
          duration_minutes?: number
          id?: string
          started_at?: string
          task_description?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          language: string | null
          photo_url: string | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          language?: string | null
          photo_url?: string | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          language?: string | null
          photo_url?: string | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reading_list: {
        Row: {
          author: string
          comments: string | null
          cover_url: string | null
          created_at: string
          current_page: number | null
          finished_at: string | null
          id: string
          pages: number | null
          rating: number | null
          started_at: string | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author: string
          comments?: string | null
          cover_url?: string | null
          created_at?: string
          current_page?: number | null
          finished_at?: string | null
          id?: string
          pages?: number | null
          rating?: number | null
          started_at?: string | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author?: string
          comments?: string | null
          cover_url?: string | null
          created_at?: string
          current_page?: number | null
          finished_at?: string | null
          id?: string
          pages?: number | null
          rating?: number | null
          started_at?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      spotify_playlists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_favorite: boolean | null
          name: string
          spotify_id: string
          tracks_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_favorite?: boolean | null
          name: string
          spotify_id: string
          tracks_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_favorite?: boolean | null
          name?: string
          spotify_id?: string
          tracks_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      spotify_recent_tracks: {
        Row: {
          album_name: string | null
          artist_name: string
          duration_ms: number | null
          id: string
          image_url: string | null
          played_at: string
          spotify_track_id: string
          track_name: string
          user_id: string
        }
        Insert: {
          album_name?: string | null
          artist_name: string
          duration_ms?: number | null
          id?: string
          image_url?: string | null
          played_at?: string
          spotify_track_id: string
          track_name: string
          user_id: string
        }
        Update: {
          album_name?: string | null
          artist_name?: string
          duration_ms?: number | null
          id?: string
          image_url?: string | null
          played_at?: string
          spotify_track_id?: string
          track_name?: string
          user_id?: string
        }
        Relationships: []
      }
      spotify_settings: {
        Row: {
          access_token: string | null
          created_at: string
          current_playlist_id: string | null
          current_track_id: string | null
          id: string
          is_playing: boolean | null
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
          volume: number | null
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          current_playlist_id?: string | null
          current_track_id?: string | null
          id?: string
          is_playing?: boolean | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
          volume?: number | null
        }
        Update: {
          access_token?: string | null
          created_at?: string
          current_playlist_id?: string | null
          current_track_id?: string | null
          id?: string
          is_playing?: boolean | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
          volume?: number | null
        }
        Relationships: []
      }
      subject_notes: {
        Row: {
          content: string
          created_at: string
          font_size: string | null
          id: string
          is_bold: boolean | null
          professor_name: string | null
          subject_name: string
          text_color: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          font_size?: string | null
          id?: string
          is_bold?: boolean | null
          professor_name?: string | null
          subject_name: string
          text_color?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          font_size?: string | null
          id?: string
          is_bold?: boolean | null
          professor_name?: string | null
          subject_name?: string
          text_color?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
