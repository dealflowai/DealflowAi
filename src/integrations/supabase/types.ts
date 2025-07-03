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
      buyers: {
        Row: {
          acquisition_timeline: string | null
          asset_types: string[] | null
          budget_max: number | null
          budget_min: number | null
          city: string | null
          contact_info: string | null
          created_at: string | null
          criteria_notes: string | null
          email: string | null
          equity_position: number | null
          financing_type: string | null
          id: string
          investment_criteria: string | null
          land_buyer: boolean | null
          last_contacted: string | null
          location_focus: string | null
          markets: string[] | null
          name: string | null
          notes: string | null
          owner_id: string
          partnership_interest: boolean | null
          phone: string | null
          portfolio_summary: string | null
          priority: string | null
          property_type_interest: string[] | null
          referral_source: string | null
          source: string | null
          state: string | null
          status: string | null
          tags: string[] | null
          tags_additional: string[] | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          acquisition_timeline?: string | null
          asset_types?: string[] | null
          budget_max?: number | null
          budget_min?: number | null
          city?: string | null
          contact_info?: string | null
          created_at?: string | null
          criteria_notes?: string | null
          email?: string | null
          equity_position?: number | null
          financing_type?: string | null
          id?: string
          investment_criteria?: string | null
          land_buyer?: boolean | null
          last_contacted?: string | null
          location_focus?: string | null
          markets?: string[] | null
          name?: string | null
          notes?: string | null
          owner_id: string
          partnership_interest?: boolean | null
          phone?: string | null
          portfolio_summary?: string | null
          priority?: string | null
          property_type_interest?: string[] | null
          referral_source?: string | null
          source?: string | null
          state?: string | null
          status?: string | null
          tags?: string[] | null
          tags_additional?: string[] | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          acquisition_timeline?: string | null
          asset_types?: string[] | null
          budget_max?: number | null
          budget_min?: number | null
          city?: string | null
          contact_info?: string | null
          created_at?: string | null
          criteria_notes?: string | null
          email?: string | null
          equity_position?: number | null
          financing_type?: string | null
          id?: string
          investment_criteria?: string | null
          land_buyer?: boolean | null
          last_contacted?: string | null
          location_focus?: string | null
          markets?: string[] | null
          name?: string | null
          notes?: string | null
          owner_id?: string
          partnership_interest?: boolean | null
          phone?: string | null
          portfolio_summary?: string | null
          priority?: string | null
          property_type_interest?: string[] | null
          referral_source?: string | null
          source?: string | null
          state?: string | null
          status?: string | null
          tags?: string[] | null
          tags_additional?: string[] | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          clerk_id: string
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          clerk_id: string
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          clerk_id?: string
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
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
