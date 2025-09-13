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
      row[header.toLowerCase()] = values[index] || ''
    })
    
    data.push(row)
  }
  
  return data
}

function generateCSV(data: any[]): string {
  if (data.length === 0) return 'name,email,phone,notes\n'
  
  const headers = ['name', 'email', 'phone', 'notes']
  const csvRows = [headers.join(',')]
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header] || ''
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
        const { data: guests, error } = await supabase
          .from('guests')
          .select('name, email, phone, notes')
          .eq('owner_id', ownerId)
          .order('name')

        if (error) throw error
        
        const csv = generateCSV(guests)
        
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', 'attachment; filename="guests.csv"')
        res.status(200).send(csv)
      } catch (error) {
        res.status(500).json({ error: 'Failed to export guests' })
      }
      break

    case 'POST':
      try {
        const { csv } = req.body
        
        if (!csv) {
          return res.status(400).json({ error: 'CSV data is required' })
        }
        
        const guestData = parseCSV(csv)
        
        if (guestData.length === 0) {
          return res.status(400).json({ error: 'No valid guest data found in CSV' })
        }
        
        // Validate required fields
        const validGuests = guestData.filter(guest => 
          guest.name && guest.email
        ).map(guest => ({
          name: guest.name,
          email: guest.email,
          phone: guest.phone || null,
          notes: guest.notes || null,
          owner_id: ownerId
        }))
        
        if (validGuests.length === 0) {
          return res.status(400).json({ error: 'No valid guests with name and email found' })
        }
        
        const { data: insertedGuests, error } = await supabase
          .from('guests')
          .insert(validGuests)
          .select()
        
        if (error) throw error
        
        res.status(201).json({ 
          message: `Successfully imported ${insertedGuests.length} guests`,
          imported: insertedGuests.length,
          skipped: guestData.length - validGuests.length
        })
      } catch (error) {
        res.status(500).json({ error: 'Failed to import guests' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}))
