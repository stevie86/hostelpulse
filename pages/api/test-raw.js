export default async function handler(req, res) {
  try {
    console.log('Raw test API route called');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';
    
    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Service Key exists:', !!supabaseServiceKey);
    console.log('Supabase Service Key length:', supabaseServiceKey?.length || 0);
    
    // Direct fetch request to Supabase REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/guests?id=eq.1`, {
      method: 'GET',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`, // Service role keys also work as Bearer tokens in some contexts
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Raw API error:', data);
      return res.status(response.status).json({ error: 'Raw API error', details: data });
    }
    
    console.log('Raw API connection successful');
    res.status(200).json({ message: 'Success', data });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Unexpected error', details: error.message });
  }
}