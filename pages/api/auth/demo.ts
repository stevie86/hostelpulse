import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Demo credentials
    const demoEmail = 'demo@hostelpulse.com';
    const demoPassword = process.env.DEMO_USER_PASSWORD || 'DemoPassword123!';
    
    // Create demo user if doesn't exist
    const supabaseClient = supabase;
    let signInResult = await supabaseClient.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    });

    if (signInResult.error) {
      if (signInResult.error.message.includes('Invalid login credentials')) {
        // User doesn't exist, create demo user
        const { error: signupError } = await supabaseClient.auth.signUp({
          email: demoEmail,
          password: demoPassword,
        });

        if (signupError) {
          throw new Error(signupError.message);
        }

        // Now sign in again
        signInResult = await supabaseClient.auth.signInWithPassword({
          email: demoEmail,
          password: demoPassword,
        });

        if (signInResult.error) {
          throw new Error(signInResult.error.message);
        }
      } else {
        throw signInResult.error;
      }
    }

    const user = signInResult.data.user;
    
    return res.status(200).json({
      success: true,
      user: user,
      message: 'Demo user authenticated successfully',
    });
  } catch (error: any) {
    console.error('Demo auth error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
}