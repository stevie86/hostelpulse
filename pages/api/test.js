// pages/api/test.js
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  try {
    console.log('Test API route called');
    
    // Use the same configuration as in lib/supabase.ts but with service key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';
    
    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Service Key exists:', !!supabaseServiceKey);
    console.log('Supabase Service Key length:', supabaseServiceKey?.length || 0);
    
    // Create client with service role key - this should allow full access bypassing RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    });
    
    // Test basic connection with service role key (bypasses RLS)
    const { data, error } = await supabase
      .from('guests')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Database error', details: error.message });
    }
    
    console.log('Database connection successful');
    res.status(200).json({ message: 'Success', data: data || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Unexpected error', details: error.message });
  }
}