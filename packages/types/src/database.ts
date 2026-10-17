
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "gallery_images": {
                  Row: {
                    "caption": string | null,"created_at": string,"id": string,"profile_id": string,"sort_order": number,"url": string
                  }
                  Insert: {
                    "caption"?: string | null,"created_at"?: string,"id"?: string,"profile_id": string,"sort_order"?: number,"url": string
                  }
                  Update: {
                    "caption"?: string | null,"created_at"?: string,"id"?: string,"profile_id"?: string,"sort_order"?: number,"url"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "gallery_images_profile_id_fkey"
      columns: ["profile_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"private_session_types": {
                  Row: {
                    "created_at": string,"description": string,"id": string,"profile_id": string,"sort_order": number,"title": string
                  }
                  Insert: {
                    "created_at"?: string,"description"?: string,"id"?: string,"profile_id": string,"sort_order"?: number,"title": string
                  }
                  Update: {
                    "created_at"?: string,"description"?: string,"id"?: string,"profile_id"?: string,"sort_order"?: number,"title"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "private_session_types_profile_id_fkey"
      columns: ["profile_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "avatar_url": string | null,"bio_long": string | null,"bio_short": string | null,"certifications": (string)[],"contact_email": string | null,"contact_phone": string | null,"created_at": string,"display_name": string,"handle": string,"id": string,"instagram_handle": string | null,"interests": (string)[],"logo_url": string | null,"plan": string,"skin": string,"specialties": (string)[],"teaches": boolean,"updated_at": string
                  }
                  Insert: {
                    "avatar_url"?: string | null,"bio_long"?: string | null,"bio_short"?: string | null,"certifications"?: (string)[],"contact_email"?: string | null,"contact_phone"?: string | null,"created_at"?: string,"display_name": string,"handle": string,"id": string,"instagram_handle"?: string | null,"interests"?: (string)[],"logo_url"?: string | null,"plan"?: string,"skin"?: string,"specialties"?: (string)[],"teaches"?: boolean,"updated_at"?: string
                  }
                  Update: {
                    "avatar_url"?: string | null,"bio_long"?: string | null,"bio_short"?: string | null,"certifications"?: (string)[],"contact_email"?: string | null,"contact_phone"?: string | null,"created_at"?: string,"display_name"?: string,"handle"?: string,"id"?: string,"instagram_handle"?: string | null,"interests"?: (string)[],"logo_url"?: string | null,"plan"?: string,"skin"?: string,"specialties"?: (string)[],"teaches"?: boolean,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"schedule_entries": {
                  Row: {
                    "address": string | null,"booking_url": string | null,"created_at": string,"id": string,"profile_id": string,"sort_order": number,"venue_logo_url": string | null,"venue_name": string
                  }
                  Insert: {
                    "address"?: string | null,"booking_url"?: string | null,"created_at"?: string,"id"?: string,"profile_id": string,"sort_order"?: number,"venue_logo_url"?: string | null,"venue_name": string
                  }
                  Update: {
                    "address"?: string | null,"booking_url"?: string | null,"created_at"?: string,"id"?: string,"profile_id"?: string,"sort_order"?: number,"venue_logo_url"?: string | null,"venue_name"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "schedule_entries_profile_id_fkey"
      columns: ["profile_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"schedule_times": {
                  Row: {
                    "day_of_week": number,"id": string,"label": string,"schedule_entry_id": string,"sort_order": number
                  }
                  Insert: {
                    "day_of_week": number,"id"?: string,"label": string,"schedule_entry_id": string,"sort_order"?: number
                  }
                  Update: {
                    "day_of_week"?: number,"id"?: string,"label"?: string,"schedule_entry_id"?: string,"sort_order"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "schedule_times_schedule_entry_id_fkey"
      columns: ["schedule_entry_id"]
isOneToOne: false
      referencedRelation: "schedule_entries"
      referencedColumns: ["id"]
    }
                  ]
                },"service_modalities": {
                  Row: {
                    "created_at": string,"description": string,"id": string,"profile_id": string,"sort_order": number,"title": string
                  }
                  Insert: {
                    "created_at"?: string,"description"?: string,"id"?: string,"profile_id": string,"sort_order"?: number,"title": string
                  }
                  Update: {
                    "created_at"?: string,"description"?: string,"id"?: string,"profile_id"?: string,"sort_order"?: number,"title"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "service_modalities_profile_id_fkey"
      columns: ["profile_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"testimonials": {
                  Row: {
                    "author_location": string | null,"author_name": string,"created_at": string,"id": string,"profile_id": string,"quote": string,"sort_order": number
                  }
                  Insert: {
                    "author_location"?: string | null,"author_name": string,"created_at"?: string,"id"?: string,"profile_id": string,"quote": string,"sort_order"?: number
                  }
                  Update: {
                    "author_location"?: string | null,"author_name"?: string,"created_at"?: string,"id"?: string,"profile_id"?: string,"quote"?: string,"sort_order"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "testimonials_profile_id_fkey"
      columns: ["profile_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "gallery_limit":
{ Args: { "plan": string }; Returns: number
                           },
"is_handle_available":
{ Args: { "h": string }; Returns: boolean
                           },
"is_reserved_handle":
{ Args: { "h": string }; Returns: boolean
                           },
"owns_schedule_entry":
{ Args: { "entry_id": string }; Returns: boolean
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const

