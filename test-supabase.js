const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSupabase() {
  try {
    console.log('Testing Supabase connection...')

    // Test hostels table
    const { data: hostels, error: hostelsError } = await supabase
      .from('hostels')
      .select('*')

    if (hostelsError) {
      console.error('Hostels query error:', hostelsError)
    } else {
      console.log('Hostels:', hostels)
    }

    // Test bookings table
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')

    if (bookingsError) {
      console.error('Bookings query error:', bookingsError)
    } else {
      console.log('Bookings:', bookings)
    }

    // Test tax_rules table
    const { data: taxRules, error: taxError } = await supabase
      .from('tax_rules')
      .select('*')

    if (taxError) {
      console.error('Tax rules query error:', taxError)
    } else {
      console.log('Tax Rules:', taxRules)
    }

  } catch (error) {
    console.error('Test failed:', error)
  }
}

testSupabase()