import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      guests: {
        Row: {
          id: string
          created_at: string
          name: string
          email: string
          phone?: string
          notes?: string
          owner_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          email: string
          phone?: string
          notes?: string
          owner_id: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          email?: string
          phone?: string
          notes?: string
          owner_id?: string
        }
      }
      rooms: {
        Row: {
          id: string
          created_at: string
          name: string
          type: 'private' | 'dorm'
          max_capacity: number
          owner_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          type: 'private' | 'dorm'
          max_capacity: number
          owner_id: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          type?: 'private' | 'dorm'
          max_capacity?: number
          owner_id?: string
        }
      }
      beds: {
        Row: {
          id: string
          created_at: string
          room_id: string
          name: string
          owner_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          room_id: string
          name: string
          owner_id: string
        }
        Update: {
          id?: string
          created_at?: string
          room_id?: string
          name?: string
          owner_id?: string
        }
      }
      bookings: {
        Row: {
          id: string
          created_at: string
          guest_id: string
          room_id?: string
          bed_id?: string
          check_in: string
          check_out: string
          status: 'confirmed' | 'pending' | 'cancelled'
          notes?: string
          owner_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          guest_id: string
          room_id?: string
          bed_id?: string
          check_in: string
          check_out: string
          status?: 'confirmed' | 'pending' | 'cancelled'
          notes?: string
          owner_id: string
        }
        Update: {
          id?: string
          created_at?: string
          guest_id?: string
          room_id?: string
          bed_id?: string
          check_in?: string
          check_out?: string
          status?: 'confirmed' | 'pending' | 'cancelled'
          notes?: string
          owner_id?: string
        }
      }
    }
  }
}
