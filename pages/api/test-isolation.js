// pages/api/test-isolation.js
import { createClient } from '@supabase/supabase-js'
import { withCors } from '../../lib/corsHandler'

export default withCors(async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('Testing database isolation');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // First, create two test users
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Create first test user
    const testEmail1 = `hostelowner1-${Date.now()}@example.com`
    const testPassword = 'TestPassword123!'
    
    const { data: { user: user1 }, error: signUpError1 } = await supabase.auth.signUp({
      email: testEmail1,
      password: testPassword,
    })

    if (signUpError1) {
      console.error('Sign up error for user 1:', signUpError1)
      return res.status(500).json({ error: 'Sign up failed for user 1', details: signUpError1.message })
    }

    console.log('User 1 created:', user1?.id)

    // Create second test user
    const testEmail2 = `hostelowner2-${Date.now()}@example.com`
    
    const { data: { user: user2 }, error: signUpError2 } = await supabase.auth.signUp({
      email: testEmail2,
      password: testPassword,
    })

    if (signUpError2) {
      console.error('Sign up error for user 2:', signUpError2)
      return res.status(500).json({ error: 'Sign up failed for user 2', details: signUpError2.message })
    }

    console.log('User 2 created:', user2?.id)

    // Sign in as first user to get their token
    const { data: signInData1, error: signInError1 } = await supabase.auth.signInWithPassword({
      email: testEmail1,
      password: testPassword,
    })

    if (signInError1) {
      console.error('Sign in error for user 1:', signInError1)
      return res.status(500).json({ error: 'Sign in failed for user 1', details: signInError1.message })
    }

    const token1 = signInData1.session?.access_token
    if (!token1) {
      return res.status(500).json({ error: 'No token for user 1' })
    }
    console.log('User 1 token obtained')

    // Create a Supabase client for user 1 using their token
    const user1Client = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token1}`
        }
      }
    })

    // Sign in as second user to get their token
    const { data: signInData2, error: signInError2 } = await supabase.auth.signInWithPassword({
      email: testEmail2,
      password: testPassword,
    })

    if (signInError2) {
      console.error('Sign in error for user 2:', signInError2)
      return res.status(500).json({ error: 'Sign in failed for user 2', details: signInError2.message })
    }

    const token2 = signInData2.session?.access_token
    if (!token2) {
      return res.status(500).json({ error: 'No token for user 2' })
    }
    console.log('User 2 token obtained')

    // Create a Supabase client for user 2 using their token
    const user2Client = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token2}`
        }
      }
    })

    // Now test data isolation:
    // User 1 creates a guest record
    const { data: guest1Data, error: guest1Error } = await user1Client
      .from('guests')
      .insert([{
        name: 'John Doe',
        email: 'john@example.com',
        owner_id: user1.id
      }])
      .select()
      .single()

    if (guest1Error) {
      console.error('Error creating guest for user 1:', guest1Error)
      return res.status(500).json({ error: 'Failed to create guest for user 1', details: guest1Error.message })
    }

    console.log('User 1 created guest:', guest1Data?.id)

    // User 2 creates a guest record
    const { data: guest2Data, error: guest2Error } = await user2Client
      .from('guests')
      .insert([{
        name: 'Jane Smith',
        email: 'jane@example.com',
        owner_id: user2.id
      }])
      .select()
      .single()

    if (guest2Error) {
      console.error('Error creating guest for user 2:', guest2Error)
      return res.status(500).json({ error: 'Failed to create guest for user 2', details: guest2Error.message })
    }

    console.log('User 2 created guest:', guest2Data?.id)

    // Now test that each user can only see their own data:
    // User 1 tries to fetch guests
    const { data: user1Guests, error: user1GuestsError } = await user1Client
      .from('guests')
      .select('*')

    if (user1GuestsError) {
      console.error('Error fetching guests for user 1:', user1GuestsError)
      return res.status(500).json({ error: 'Failed to fetch guests for user 1', details: user1GuestsError.message })
    }

    console.log('User 1 can see', user1Guests?.length, 'guests')
    const user1HasOwnGuest = user1Guests.some(guest => guest.id === guest1Data.id)
    const user1HasOtherGuest = user1Guests.some(guest => guest.id === guest2Data.id)

    // User 2 tries to fetch guests
    const { data: user2Guests, error: user2GuestsError } = await user2Client
      .from('guests')
      .select('*')

    if (user2GuestsError) {
      console.error('Error fetching guests for user 2:', user2GuestsError)
      return res.status(500).json({ error: 'Failed to fetch guests for user 2', details: user2GuestsError.message })
    }

    console.log('User 2 can see', user2Guests?.length, 'guests')
    const user2HasOwnGuest = user2Guests.some(guest => guest.id === guest2Data.id)
    const user2HasOtherGuest = user2Guests.some(guest => guest.id === guest1Data.id)

    // Verify data isolation
    const isolationWorking = 
      user1Guests.length === 1 && 
      user1HasOwnGuest && 
      !user1HasOtherGuest &&
      user2Guests.length === 1 && 
      user2HasOwnGuest && 
      !user2HasOtherGuest

    res.status(200).json({ 
      success: true, 
      isolationWorking,
      user1: {
        id: user1.id,
        guestsCount: user1Guests.length,
        hasOwnGuest: user1HasOwnGuest,
        hasOtherGuest: user1HasOtherGuest
      },
      user2: {
        id: user2.id,
        guestsCount: user2Guests.length,
        hasOwnGuest: user2HasOwnGuest,
        hasOtherGuest: user2HasOtherGuest
      }
    })
  } catch (error) {
    console.error('Database isolation test error:', error)
    res.status(500).json({ error: 'Database isolation test failed', details: error.message })
  }
})