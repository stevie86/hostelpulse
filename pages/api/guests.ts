import type { NextApiRequest, NextApiResponse } from 'next'
import { getSupabaseServer } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const supabase = getSupabaseServer()
    if (!supabase) return res.status(503).json({ error: 'Supabase is not configured' })
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('guests').select('*').order('created_at', { ascending: false })
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ guests: data })
    }

    if (req.method === 'POST') {
      const { name, email, phone, nationality } = req.body || {}
      if (!name) return res.status(400).json({ error: 'name is required' })
      const { data, error } = await supabase.from('guests').insert({ name, email, phone, nationality }).select('*').single()
      if (error) return res.status(500).json({ error: error.message })
      return res.status(201).json({ guest: data })
    }

    if (req.method === 'PUT') {
      const { id, name, email, phone, nationality } = req.body || {}
      if (!id) return res.status(400).json({ error: 'id is required' })
      const { data, error } = await supabase
        .from('guests')
        .update({ name, email, phone, nationality })
        .eq('id', id)
        .select('*')
        .single()
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ guest: data })
    }

    res.setHeader('Allow', 'GET,POST,PUT')
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Unexpected error' })
  }
}
