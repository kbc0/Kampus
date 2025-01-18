export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          university: string | null
          bio: string | null
          updated_at: string
          created_at: string
          avatar_url: string | null
          major: string | null
          minor: string | null
          subjects: Json | null
        }
        Insert: {
          id: string
          name: string
          university?: string | null
          bio?: string | null
          updated_at?: string
          created_at?: string
          avatar_url?: string | null
          major?: string | null
          minor?: string | null
          subjects?: Json | null
        }
        Update: {
          id?: string
          name?: string
          university?: string | null
          bio?: string | null
          updated_at?: string
          created_at?: string
          avatar_url?: string | null
          major?: string | null
          minor?: string | null
          subjects?: Json | null
        }
      }
    }
  }
}