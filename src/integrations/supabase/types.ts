export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      buyer_comments: {
        Row: {
          author_id: string
          body: string
          buyer_id: string | null
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          body: string
          buyer_id?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          body?: string
          buyer_id?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buyer_comments_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
        ]
      }
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
      contracts: {
        Row: {
          buyer_email: string | null
          buyer_name: string | null
          closing_date: string | null
          contract_content: string | null
          created_at: string | null
          deal_id: string | null
          earnest_money: number | null
          id: string
          owner_id: string
          property_address: string
          purchase_price: number | null
          seller_email: string | null
          seller_name: string | null
          sent_for_signature_at: string | null
          special_terms: string | null
          status: string | null
          template_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          buyer_email?: string | null
          buyer_name?: string | null
          closing_date?: string | null
          contract_content?: string | null
          created_at?: string | null
          deal_id?: string | null
          earnest_money?: number | null
          id?: string
          owner_id: string
          property_address: string
          purchase_price?: number | null
          seller_email?: string | null
          seller_name?: string | null
          sent_for_signature_at?: string | null
          special_terms?: string | null
          status?: string | null
          template_type: string
          title: string
          updated_at?: string | null
        }
        Update: {
          buyer_email?: string | null
          buyer_name?: string | null
          closing_date?: string | null
          contract_content?: string | null
          created_at?: string | null
          deal_id?: string | null
          earnest_money?: number | null
          id?: string
          owner_id?: string
          property_address?: string
          purchase_price?: number | null
          seller_email?: string | null
          seller_name?: string | null
          sent_for_signature_at?: string | null
          special_terms?: string | null
          status?: string | null
          template_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          channel: string | null
          contact_id: string | null
          contact_type: string | null
          created_at: string | null
          deal_id: string | null
          direction: string | null
          id: number
          message: string | null
          owner_id: string
          response_received: boolean | null
          scheduled_followup: string | null
        }
        Insert: {
          channel?: string | null
          contact_id?: string | null
          contact_type?: string | null
          created_at?: string | null
          deal_id?: string | null
          direction?: string | null
          id?: number
          message?: string | null
          owner_id: string
          response_received?: boolean | null
          scheduled_followup?: string | null
        }
        Update: {
          channel?: string | null
          contact_id?: string | null
          contact_type?: string | null
          created_at?: string | null
          deal_id?: string | null
          direction?: string | null
          id?: number
          message?: string | null
          owner_id?: string
          response_received?: boolean | null
          scheduled_followup?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          address: string
          ai_score: number | null
          arv: number | null
          city: string | null
          condition_score: number | null
          contract_pdf_url: string | null
          created_at: string | null
          deal_type: string | null
          featured_until: string | null
          id: string
          lat: number | null
          list_price: number | null
          loi_pdf_url: string | null
          lon: number | null
          margin: number | null
          max_offer: number | null
          notes: string | null
          owner_id: string
          repair_estimate: number | null
          seller_contact: string | null
          seller_email: string | null
          seller_phone: string | null
          state: string | null
          status: string | null
          top_buyer_ids: string[] | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address: string
          ai_score?: number | null
          arv?: number | null
          city?: string | null
          condition_score?: number | null
          contract_pdf_url?: string | null
          created_at?: string | null
          deal_type?: string | null
          featured_until?: string | null
          id?: string
          lat?: number | null
          list_price?: number | null
          loi_pdf_url?: string | null
          lon?: number | null
          margin?: number | null
          max_offer?: number | null
          notes?: string | null
          owner_id: string
          repair_estimate?: number | null
          seller_contact?: string | null
          seller_email?: string | null
          seller_phone?: string | null
          state?: string | null
          status?: string | null
          top_buyer_ids?: string[] | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string
          ai_score?: number | null
          arv?: number | null
          city?: string | null
          condition_score?: number | null
          contract_pdf_url?: string | null
          created_at?: string | null
          deal_type?: string | null
          featured_until?: string | null
          id?: string
          lat?: number | null
          list_price?: number | null
          loi_pdf_url?: string | null
          lon?: number | null
          margin?: number | null
          max_offer?: number | null
          notes?: string | null
          owner_id?: string
          repair_estimate?: number | null
          seller_contact?: string | null
          seller_email?: string | null
          seller_phone?: string | null
          state?: string | null
          status?: string | null
          top_buyer_ids?: string[] | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      organization_limits: {
        Row: {
          created_at: string | null
          daily_tokens: number | null
          id: string
          org_id: string
          seat_limit: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          daily_tokens?: number | null
          id?: string
          org_id: string
          seat_limit?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          daily_tokens?: number | null
          id?: string
          org_id?: string
          seat_limit?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      phone_verifications: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          phone_number: string
          updated_at: string
          user_id: string
          verification_code: string
          verified: boolean
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          phone_number: string
          updated_at?: string
          user_id: string
          verification_code: string
          verified?: boolean
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          phone_number?: string
          updated_at?: string
          user_id?: string
          verification_code?: string
          verified?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string | null
          brokerage_name: string | null
          budget_max: number | null
          budget_min: number | null
          clerk_id: string
          company_name: string | null
          consent_given: boolean | null
          created_at: string | null
          deal_types: string[] | null
          email: string | null
          financing_type: string | null
          first_name: string | null
          has_completed_onboarding: boolean | null
          id: string
          last_name: string | null
          last_token_grant_date: string | null
          license_number: string | null
          markets_served: string[] | null
          monthly_deal_volume: string | null
          next_token_grant_date: string | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          phone: string | null
          phone_verified: boolean | null
          plan_tokens: number | null
          preferred_markets: string[] | null
          primary_markets: string[] | null
          property_types: string[] | null
          roi_target: number | null
          role: string | null
          selected_plan: string | null
          subscription_start_date: string | null
          timeline_to_close: string | null
          typical_clients: string[] | null
          updated_at: string | null
          user_role: string | null
        }
        Insert: {
          bio?: string | null
          brokerage_name?: string | null
          budget_max?: number | null
          budget_min?: number | null
          clerk_id: string
          company_name?: string | null
          consent_given?: boolean | null
          created_at?: string | null
          deal_types?: string[] | null
          email?: string | null
          financing_type?: string | null
          first_name?: string | null
          has_completed_onboarding?: boolean | null
          id?: string
          last_name?: string | null
          last_token_grant_date?: string | null
          license_number?: string | null
          markets_served?: string[] | null
          monthly_deal_volume?: string | null
          next_token_grant_date?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          phone?: string | null
          phone_verified?: boolean | null
          plan_tokens?: number | null
          preferred_markets?: string[] | null
          primary_markets?: string[] | null
          property_types?: string[] | null
          roi_target?: number | null
          role?: string | null
          selected_plan?: string | null
          subscription_start_date?: string | null
          timeline_to_close?: string | null
          typical_clients?: string[] | null
          updated_at?: string | null
          user_role?: string | null
        }
        Update: {
          bio?: string | null
          brokerage_name?: string | null
          budget_max?: number | null
          budget_min?: number | null
          clerk_id?: string
          company_name?: string | null
          consent_given?: boolean | null
          created_at?: string | null
          deal_types?: string[] | null
          email?: string | null
          financing_type?: string | null
          first_name?: string | null
          has_completed_onboarding?: boolean | null
          id?: string
          last_name?: string | null
          last_token_grant_date?: string | null
          license_number?: string | null
          markets_served?: string[] | null
          monthly_deal_volume?: string | null
          next_token_grant_date?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          phone?: string | null
          phone_verified?: boolean | null
          plan_tokens?: number | null
          preferred_markets?: string[] | null
          primary_markets?: string[] | null
          property_types?: string[] | null
          roi_target?: number | null
          role?: string | null
          selected_plan?: string | null
          subscription_start_date?: string | null
          timeline_to_close?: string | null
          typical_clients?: string[] | null
          updated_at?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          identifier: string
          requests_count: number
          updated_at: string
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          identifier: string
          requests_count?: number
          updated_at?: string
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          identifier?: string
          requests_count?: number
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
      signup_security: {
        Row: {
          attempts_count: number
          block_reason: string | null
          blocked_until: string | null
          created_at: string
          device_fingerprint: string | null
          email_domain: string
          id: string
          ip_address: unknown
          phone_number: string | null
          updated_at: string
        }
        Insert: {
          attempts_count?: number
          block_reason?: string | null
          blocked_until?: string | null
          created_at?: string
          device_fingerprint?: string | null
          email_domain: string
          id?: string
          ip_address: unknown
          phone_number?: string | null
          updated_at?: string
        }
        Update: {
          attempts_count?: number
          block_reason?: string | null
          blocked_until?: string | null
          created_at?: string
          device_fingerprint?: string | null
          email_domain?: string
          id?: string
          ip_address?: unknown
          phone_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      token_purchases: {
        Row: {
          amount_paid: number
          created_at: string
          id: string
          status: string
          stripe_session_id: string | null
          tokens_purchased: number
          user_id: string
        }
        Insert: {
          amount_paid: number
          created_at?: string
          id?: string
          status?: string
          stripe_session_id?: string | null
          tokens_purchased: number
          user_id: string
        }
        Update: {
          amount_paid?: number
          created_at?: string
          id?: string
          status?: string
          stripe_session_id?: string | null
          tokens_purchased?: number
          user_id?: string
        }
        Relationships: []
      }
      user_tokens: {
        Row: {
          created_at: string
          id: string
          monthly_allowance: number | null
          monthly_reset_date: string | null
          remaining_tokens: number | null
          total_tokens: number
          updated_at: string
          used_tokens: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          monthly_allowance?: number | null
          monthly_reset_date?: string | null
          remaining_tokens?: number | null
          total_tokens?: number
          updated_at?: string
          used_tokens?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          monthly_allowance?: number | null
          monthly_reset_date?: string | null
          remaining_tokens?: number | null
          total_tokens?: number
          updated_at?: string
          used_tokens?: number
          user_id?: string
        }
        Relationships: []
      }
      user_usage: {
        Row: {
          ai_analyzer_runs: number | null
          ai_discovery_runs: number | null
          ai_matching_runs: number | null
          buyer_contacts: number | null
          contracts_created: number | null
          created_at: string | null
          id: string
          marketplace_listings: number | null
          month_year: string
          seller_contacts: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_analyzer_runs?: number | null
          ai_discovery_runs?: number | null
          ai_matching_runs?: number | null
          buyer_contacts?: number | null
          contracts_created?: number | null
          created_at?: string | null
          id?: string
          marketplace_listings?: number | null
          month_year: string
          seller_contacts?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_analyzer_runs?: number | null
          ai_discovery_runs?: number | null
          ai_matching_runs?: number | null
          buyer_contacts?: number | null
          contracts_created?: number | null
          created_at?: string | null
          id?: string
          marketplace_listings?: number | null
          month_year?: string
          seller_contacts?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      admin_deals_stats: {
        Row: {
          avg_margin: number | null
          deals_30d: number | null
          deals_7d: number | null
          total_deals: number | null
        }
        Relationships: []
      }
      admin_token_stats: {
        Row: {
          active_orgs: number | null
          total_tokens_used: number | null
        }
        Relationships: []
      }
      admin_user_stats: {
        Row: {
          active_users_7d: number | null
          new_users_30d: number | null
          total_users: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_tokens: {
        Args: { p_user_id: string; p_tokens: number }
        Returns: boolean
      }
      bytea_to_text: {
        Args: { data: string }
        Returns: string
      }
      check_rate_limit: {
        Args: {
          p_identifier: string
          p_endpoint: string
          p_max_requests?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      check_signup_security: {
        Args: {
          p_ip_address: unknown
          p_email_domain: string
          p_device_fingerprint?: string
          p_phone_number?: string
        }
        Returns: Json
      }
      cleanup_rate_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_notification: {
        Args: {
          p_user_id: string
          p_type: string
          p_title: string
          p_message: string
          p_data?: Json
        }
        Returns: string
      }
      debug_current_user: {
        Args: Record<PropertyKey, never>
        Returns: {
          jwt_sub: string
          auth_uid: string
          profile_exists: boolean
          profile_role: string
        }[]
      }
      deduct_tokens: {
        Args: { p_user_id: string; p_tokens: number }
        Returns: boolean
      }
      get_current_month_usage: {
        Args: { p_user_id: string }
        Returns: {
          ai_analyzer_runs: number
          ai_matching_runs: number
          ai_discovery_runs: number
          contracts_created: number
          buyer_contacts: number
          seller_contacts: number
          marketplace_listings: number
        }[]
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_tokens: {
        Args: { p_user_id: string }
        Returns: {
          total_tokens: number
          used_tokens: number
          remaining_tokens: number
        }[]
      }
      grant_monthly_tokens: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          tokens_granted: number
          next_grant_date: string
        }[]
      }
      grant_tokens_to_user: {
        Args: { p_user_id: string; p_tokens?: number }
        Returns: boolean
      }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_delete: {
        Args:
          | { uri: string }
          | { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_get: {
        Args: { uri: string } | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_post: {
        Args:
          | { uri: string; content: string; content_type: string }
          | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_put: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      increment_usage: {
        Args: { p_user_id: string; p_usage_type: string; p_increment?: number }
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          p_user_id: string
          p_admin_id: string
          p_action: string
          p_resource_type?: string
          p_resource_id?: string
          p_details?: Json
          p_ip_address?: unknown
          p_user_agent?: string
        }
        Returns: string
      }
      log_signup_attempt: {
        Args: {
          p_ip_address: unknown
          p_email_domain: string
          p_device_fingerprint?: string
          p_phone_number?: string
          p_success?: boolean
        }
        Returns: undefined
      }
      reset_monthly_tokens: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      text_to_bytea: {
        Args: { data: string }
        Returns: string
      }
      urlencode: {
        Args: { data: Json } | { string: string } | { string: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
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
    Enums: {},
  },
} as const
