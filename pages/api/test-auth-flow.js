// pages/api/test-auth-flow.js
import { createClient } from '@supabase/supabase-js'
import { withCors } from '../../lib/corsHandler'

export default withCors(async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('Testing auth flow');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Try to create a test user
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'TestPassword123!'
    
    console.log(`Creating test user: ${testEmail}`)
    
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })

    if (signUpError) {
      console.error('Sign up error:', signUpError)
      return res.status(500).json({ error: 'Sign up failed', details: signUpError.message })
    }

    console.log('User created:', user?.id)

    // Now try to sign in to get a session/token
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })

    if (signInError) {
      console.error('Sign in error:', signInError)
      return res.status(500).json({ error: 'Sign in failed', details: signInError.message })
    }

    const session = signInData?.session
    const token = session?.access_token

    if (!token) {
      return res.status(500).json({ error: 'No token received' })
    }

    console.log('Successfully obtained token')

    // Now try to use the token to access a protected endpoint (status)
    const statusResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseAnonKey,
      },
    })
    
    if (!statusResponse.ok) {
      console.error('Status check failed:', statusResponse.status, await statusResponse.text())
      return res.status(500).json({ error: 'Status check failed', status: statusResponse.status })
    }

    const userData = await statusResponse.json()
    console.log('User data from auth:', userData)

    res.status(200).json({ 
      success: true, 
      userId: user?.id, 
      token: token.substring(0, 20) + '...', // Don't return full token for security
      userData: userData 
    })
  } catch (error) {
    console.error('Auth flow test error:', error)
    res.status(500).json({ error: 'Auth flow test failed', details: error.message })
  }
})