import { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '../../../lib/apiAuth'
import { withCors } from '../../../lib/corsHandler'
import { supabase } from '../../../lib/supabase'

function parseCSV(csvText: string): any[] {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) return []
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  const data = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
    const row: any = {}
    
    headers.forEach((header, index) => {
      row[header.toLowerCase().replace(/\s+/g, '_')] = values[index] || ''
    })
    
    data.push(row)
  }
  
  return data
}

function generateCSV(data: any[]): string {
  if (data.length === 0) return 'guest_name,guest_email,room_name,bed_name,check_in,check_out,status,notes\n'
  
  const headers = ['guest_name', 'guest_email', 'room_name', 'bed_name', 'check_in', 'check_out', 'status', 'notes']
  const csvRows = [headers.join(',')]
  
  data.forEach(row => {
    const values = headers.map(header => {
      let value = ''
      switch (header) {
        case 'guest_name':
          value = row.guests?.name || ''
          break
        case 'guest_email':
          value = row.guests?.email || ''
          break
        case 'room_name':
          value = row.rooms?.name || ''
          break
        case 'bed_name':
          value = row.beds?.name || ''
          break
        default:
          value = row[header] || ''
      }
      return `"${value.toString().replace(/"/g, '""')}"`
    })
    csvRows.push(values.join(','))
  })
  
  return csvRows.join('\n')
}

export default withCors(withAuth(async (req: NextApiRequest, res: NextApiResponse, auth) => {
  const { method } = req
  const ownerId = auth.user?.id || 'demo-owner'

  switch (method) {
    case 'GET':
      try {
        const { data: bookings, error } = await supabase
          .from('bookings')
          .select(`
            check_in,
            check_out,
            status,
            notes,
            guests(name, email),
            rooms(name),
            beds(name)
          `)
          .eq('owner_id', ownerId)
          .order('check_in')

        if (error) throw error
        
        const csv = generateCSV(bookings)
        
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', 'attachment; filename="bookings.csv"')
        res.status(200).send(csv)
      } catch (error) {
        res.status(500).json({ error: 'Failed to export bookings' })
      }
      break

    case 'POST':
      try {
        res.status(501).json({ 
          error: 'Booking CSV import not yet implemented',
          message: 'CSV import for bookings requires guest and room lookup logic'
        })
      } catch (error) {
        res.status(500).json({ error: 'Failed to import bookings' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}))
