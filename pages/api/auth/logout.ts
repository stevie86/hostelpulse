import { NextApiRequest, NextApiResponse } from 'next'
import { withCors } from '../../../lib/corsHandler'
import { supabase } from '../../../lib/supabase'

export default withCors(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
    return
  }

  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      res.status(500).json({ error: 'Failed to logout', success: false })
      return
    }
    
    res.status(200).json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to logout', success: false })
  }
})