import { createClient } from '@supabase/supabase-js'

// Use safe fallbacks so Next.js build doesn’t crash when envs are missing in Preview
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error during logout:', error.message)
    throw error
  }
  // Clear any local storage if needed
  if (typeof window !== 'undefined') {
    localStorage.clear()
  }
}

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
    },
    housekeeping_tasks: {
      Row: {
        id: string
        created_at: string
        room_id: string
        assigned_to?: string
        assigned_date: string
        completed: boolean
        completed_by?: string
        completed_at?: string
        notes?: string
        task_type: 'checkout_cleaning' | 'maintenance' | 'inspection' | 'deep_clean'
        owner_id: string
      }
      Insert: {
        id?: string
        created_at?: string
        room_id: string
        assigned_to?: string
        assigned_date?: string
        completed?: boolean
        completed_by?: string
        completed_at?: string
        notes?: string
        task_type: 'checkout_cleaning' | 'maintenance' | 'inspection' | 'deep_clean'
        owner_id: string
      }
      Update: {
        id?: string
        created_at?: string
        room_id?: string
        assigned_to?: string
        assigned_date?: string
        completed?: boolean
        completed_by?: string
        completed_at?: string
        notes?: string
        task_type?: 'checkout_cleaning' | 'maintenance' | 'inspection' | 'deep_clean'
        owner_id?: string
      }
    },
    payments: {
      Row: {
        id: string
        created_at: string
        booking_id: string
        amount: number
        currency: string
        method: string
        status: string
        notes?: string
        owner_id: string
      }
      Insert: {
        id?: string
        created_at?: string
        booking_id: string
        amount: number
        currency: string
        method: string
        status: string
        notes?: string
        owner_id: string
      }
      Update: {
        id?: string
        created_at?: string
        booking_id?: string
        amount?: number
        currency?: string
        method?: string
        status?: string
        notes?: string
        owner_id?: string
      }
    },
    notifications: {
      Row: {
        id: string
        created_at: string
        user_id: string
        title: string
        message: string
        type: 'info' | 'warning' | 'urgent' | 'success'
        read: boolean
        booking_id?: string
        guest_id?: string
      }
      Insert: {
        id?: string
        created_at?: string
        user_id: string
        title: string
        message: string
        type: 'info' | 'warning' | 'urgent' | 'success'
        read?: boolean
        booking_id?: string
        guest_id?: string
      }
      Update: {
        id?: string
        created_at?: string
        user_id?: string
        title?: string
        message?: string
        type?: 'info' | 'warning' | 'urgent' | 'success'
        read?: boolean
        booking_id?: string
        guest_id?: string
      }
    }
  }
}
