
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
            "event_occurrences": {
                  Row: {
                    "area": string | null,"booking_mode": string | null,"booking_url": string | null,"capacity": number | null,"created_at": string,"description": string | null,"ends_at": string,"event_id": string,"format": string | null,"id": string,"is_modified": boolean,"is_private_home": boolean | null,"online_url": string | null,"original_starts_at": string,"starts_at": string,"status": string,"time_zone": string | null,"title": string | null,"updated_at": string,"venue_id": string | null
                  }
                  Insert: {
                    "area"?: string | null,"booking_mode"?: string | null,"booking_url"?: string | null,"capacity"?: number | null,"created_at"?: string,"description"?: string | null,"ends_at": string,"event_id": string,"format"?: string | null,"id"?: string,"is_modified"?: boolean,"is_private_home"?: boolean | null,"online_url"?: string | null,"original_starts_at": string,"starts_at": string,"status"?: string,"time_zone"?: string | null,"title"?: string | null,"updated_at"?: string,"venue_id"?: string | null
                  }
                  Update: {
                    "area"?: string | null,"booking_mode"?: string | null,"booking_url"?: string | null,"capacity"?: number | null,"created_at"?: string,"description"?: string | null,"ends_at"?: string,"event_id"?: string,"format"?: string | null,"id"?: string,"is_modified"?: boolean,"is_private_home"?: boolean | null,"online_url"?: string | null,"original_starts_at"?: string,"starts_at"?: string,"status"?: string,"time_zone"?: string | null,"title"?: string | null,"updated_at"?: string,"venue_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "event_occurrences_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "events"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "event_occurrences_venue_id_fkey"
      columns: ["venue_id"]
isOneToOne: false
      referencedRelation: "venues"
      referencedColumns: ["id"]
    }
                  ]
                },"events": {
                  Row: {
                    "area": string | null,"booking_mode": string,"booking_url": string | null,"capacity": number | null,"created_at": string,"description": string | null,"duration_minutes": number | null,"ends_at": string | null,"format": string,"id": string,"interests": (string)[],"is_private_home": boolean,"kind": string,"local_start_time": string | null,"online_url": string | null,"profile_id": string,"repeat_until": string | null,"starts_at": string | null,"status": string,"time_zone": string,"title": string,"updated_at": string,"venue_id": string | null,"visibility": string,"weekly_days": (number)[] | null
                  }
                  Insert: {
                    "area"?: string | null,"booking_mode"?: string,"booking_url"?: string | null,"capacity"?: number | null,"created_at"?: string,"description"?: string | null,"duration_minutes"?: number | null,"ends_at"?: string | null,"format"?: string,"id"?: string,"interests"?: (string)[],"is_private_home"?: boolean,"kind"?: string,"local_start_time"?: string | null,"online_url"?: string | null,"profile_id": string,"repeat_until"?: string | null,"starts_at"?: string | null,"status"?: string,"time_zone": string,"title": string,"updated_at"?: string,"venue_id"?: string | null,"visibility"?: string,"weekly_days"?: (number)[] | null
                  }
                  Update: {
                    "area"?: string | null,"booking_mode"?: string,"booking_url"?: string | null,"capacity"?: number | null,"created_at"?: string,"description"?: string | null,"duration_minutes"?: number | null,"ends_at"?: string | null,"format"?: string,"id"?: string,"interests"?: (string)[],"is_private_home"?: boolean,"kind"?: string,"local_start_time"?: string | null,"online_url"?: string | null,"profile_id"?: string,"repeat_until"?: string | null,"starts_at"?: string | null,"status"?: string,"time_zone"?: string,"title"?: string,"updated_at"?: string,"venue_id"?: string | null,"visibility"?: string,"weekly_days"?: (number)[] | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "events_profile_id_fkey"
      columns: ["profile_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "events_venue_id_fkey"
      columns: ["venue_id"]
isOneToOne: false
      referencedRelation: "venues"
      referencedColumns: ["id"]
    }
                  ]
                },"gallery_images": {
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
                    "avatar_url": string | null,"bio_long": string | null,"bio_short": string | null,"certifications": (string)[],"contact_email": string | null,"contact_phone": string | null,"created_at": string,"display_name": string,"handle": string,"id": string,"instagram_handle": string | null,"interests": (string)[],"logo_url": string | null,"plan": string,"skin": string,"specialties": (string)[],"teaches": boolean,"testimonials_background_url": string | null,"updated_at": string
                  }
                  Insert: {
                    "avatar_url"?: string | null,"bio_long"?: string | null,"bio_short"?: string | null,"certifications"?: (string)[],"contact_email"?: string | null,"contact_phone"?: string | null,"created_at"?: string,"display_name": string,"handle": string,"id": string,"instagram_handle"?: string | null,"interests"?: (string)[],"logo_url"?: string | null,"plan"?: string,"skin"?: string,"specialties"?: (string)[],"teaches"?: boolean,"testimonials_background_url"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "avatar_url"?: string | null,"bio_long"?: string | null,"bio_short"?: string | null,"certifications"?: (string)[],"contact_email"?: string | null,"contact_phone"?: string | null,"created_at"?: string,"display_name"?: string,"handle"?: string,"id"?: string,"instagram_handle"?: string | null,"interests"?: (string)[],"logo_url"?: string | null,"plan"?: string,"skin"?: string,"specialties"?: (string)[],"teaches"?: boolean,"testimonials_background_url"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    
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
                },"venues": {
                  Row: {
                    "address": string | null,"booking_url": string | null,"created_at": string,"created_by": string | null,"id": string,"is_private": boolean,"location": unknown,"logo_url": string | null,"name": string,"time_zone": string,"updated_at": string
                  }
                  Insert: {
                    "address"?: string | null,"booking_url"?: string | null,"created_at"?: string,"created_by"?: string | null,"id"?: string,"is_private"?: boolean,"location"?: unknown,"logo_url"?: string | null,"name": string,"time_zone": string,"updated_at"?: string
                  }
                  Update: {
                    "address"?: string | null,"booking_url"?: string | null,"created_at"?: string,"created_by"?: string | null,"id"?: string,"is_private"?: boolean,"location"?: unknown,"logo_url"?: string | null,"name"?: string,"time_zone"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "venues_created_by_fkey"
      columns: ["created_by"]
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
            "event_desired_occurrences":
{ Args: { "e": Database["public"]['Tables']["events"]['Row'],"horizon": string }; Returns: {
              "ends_at": string,"starts_at": string
            }[]
                           },
"extend_occurrence_windows":
{ Args: Record<PropertyKey, never>; Returns: undefined
                           },
"gallery_limit":
{ Args: { "plan": string }; Returns: number
                           },
"is_handle_available":
{ Args: { "h": string }; Returns: boolean
                           },
"is_larger_event":
{ Args: { "capacity": number }; Returns: boolean
                           },
"is_reserved_handle":
{ Args: { "h": string }; Returns: boolean
                           },
"is_time_zone":
{ Args: { "tz": string }; Returns: boolean
                           },
"reset_occurrence":
{ Args: { "p_occurrence_id": string }; Returns: undefined
                           },
"sync_event_occurrences":
{ Args: { "p_event_id": string }; Returns: undefined
                           },
"upcoming_occurrences":
{ Args: { "p_limit"?: number,"p_profile_id": string }; Returns: {
              "area": string | null,
"booking_mode": string | null,
"booking_url": string | null,
"capacity": number | null,
"created_at": string,
"description": string | null,
"ends_at": string,
"event_id": string,
"format": string | null,
"id": string,
"is_modified": boolean,
"is_private_home": boolean | null,
"online_url": string | null,
"original_starts_at": string,
"starts_at": string,
"status": string,
"time_zone": string | null,
"title": string | null,
"updated_at": string,
"venue_id": string | null
            }[]
                          SetofOptions: {
        from: "*"
        to: "event_occurrences"
        isOneToOne: false
        isSetofReturn: true
      } }
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

