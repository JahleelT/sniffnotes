
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "collection_items": {
                  Row: {
                    "added_at": string,"collection_id": string,"fragrance_id": string
                  }
                  Insert: {
                    "added_at"?: string,"collection_id": string,"fragrance_id": string
                  }
                  Update: {
                    "added_at"?: string,"collection_id"?: string,"fragrance_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "collection_items_collection_id_fkey"
      columns: ["collection_id"]
isOneToOne: false
      referencedRelation: "collections"
      referencedColumns: ["id"]
    }
                  ]
                },"collections": {
                  Row: {
                    "created_at": string,"id": string,"kind": Database["public"]['Enums']["collection_kind"],"name": string,"shared_with_friends": boolean,"user_id": string
                  }
                  Insert: {
                    "created_at"?: string,"id"?: string,"kind"?: Database["public"]['Enums']["collection_kind"],"name": string,"shared_with_friends"?: boolean,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"kind"?: Database["public"]['Enums']["collection_kind"],"name"?: string,"shared_with_friends"?: boolean,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"daily_picks": {
                  Row: {
                    "created_at": string,"cycle": number,"fragrance_id": string,"pick_date": string,"user_id": string
                  }
                  Insert: {
                    "created_at"?: string,"cycle"?: number,"fragrance_id": string,"pick_date": string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"cycle"?: number,"fragrance_id"?: string,"pick_date"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"description_suggestions": {
                  Row: {
                    "body": string,"created_at": string,"fragrance_id": string,"id": string,"updated_at": string,"user_id": string
                  }
                  Insert: {
                    "body": string,"created_at"?: string,"fragrance_id": string,"id"?: string,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "body"?: string,"created_at"?: string,"fragrance_id"?: string,"id"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"description_votes": {
                  Row: {
                    "created_at": string,"suggestion_id": string,"user_id": string,"value": number
                  }
                  Insert: {
                    "created_at"?: string,"suggestion_id": string,"user_id": string,"value": number
                  }
                  Update: {
                    "created_at"?: string,"suggestion_id"?: string,"user_id"?: string,"value"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "description_votes_suggestion_id_fkey"
      columns: ["suggestion_id"]
isOneToOne: false
      referencedRelation: "description_suggestions"
      referencedColumns: ["id"]
    }
                  ]
                },"friendships": {
                  Row: {
                    "addressee_id": string,"created_at": string,"requester_id": string,"responded_at": string | null,"status": string
                  }
                  Insert: {
                    "addressee_id": string,"created_at"?: string,"requester_id": string,"responded_at"?: string | null,"status"?: string
                  }
                  Update: {
                    "addressee_id"?: string,"created_at"?: string,"requester_id"?: string,"responded_at"?: string | null,"status"?: string
                  }
                  Relationships: [
                    
                  ]
                },"profiles": {
                  Row: {
                    "created_at": string,"display_name": string,"id": string,"preferences": NonNullable<Json>,"updated_at": string,"username": string | null
                  }
                  Insert: {
                    "created_at"?: string,"display_name"?: string,"id": string,"preferences"?: NonNullable<Json>,"updated_at"?: string,"username"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"display_name"?: string,"id"?: string,"preferences"?: NonNullable<Json>,"updated_at"?: string,"username"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"reviews": {
                  Row: {
                    "body": string,"created_at": string,"fragrance_id": string,"id": string,"longevity": number | null,"rating": number,"seasons": (Database["public"]['Enums']["season"])[],"sillage": number | null,"updated_at": string,"user_id": string
                  }
                  Insert: {
                    "body"?: string,"created_at"?: string,"fragrance_id": string,"id"?: string,"longevity"?: number | null,"rating": number,"seasons"?: (Database["public"]['Enums']["season"])[],"sillage"?: number | null,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "body"?: string,"created_at"?: string,"fragrance_id"?: string,"id"?: string,"longevity"?: number | null,"rating"?: number,"seasons"?: (Database["public"]['Enums']["season"])[],"sillage"?: number | null,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            "fragrance_review_stats": {
                  Row: {
                    "avg_longevity": number | null,"avg_rating": number | null,"avg_sillage": number | null,"fall": number | null,"fragrance_id": string | null,"longevity_votes": number | null,"review_count": number | null,"season_votes": number | null,"sillage_votes": number | null,"spring": number | null,"summer": number | null,"winter": number | null
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Functions: {
            "are_friends":
{ Args: { "a": string,"b": string }; Returns: boolean
                           },
"create_default_collections":
{ Args: { "target_user": string }; Returns: undefined
                           },
"find_profiles":
{ Args: { "search": string }; Returns: {
              "display_name": string,"id": string,"username": string
            }[]
                           },
"profile_by_username":
{ Args: { "handle": string }; Returns: {
              "display_name": string,"id": string,"username": string
            }[]
                           },
"public_profiles":
{ Args: { "user_ids": (string)[] }; Returns: {
              "display_name": string,"id": string,"username": string
            }[]
                           }
          }
          Enums: {
            "collection_kind": "saved"|"wishlist"|"sampled"|"owned"|"custom","season": "spring"|"summer"|"fall"|"winter"
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
  "public": {
          Enums: {
            "collection_kind": ["saved", "wishlist", "sampled", "owned", "custom"],"season": ["spring", "summer", "fall", "winter"]
          }
        }
} as const
