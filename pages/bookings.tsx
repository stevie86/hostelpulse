import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Container from 'components/Container'
import SectionTitle from 'components/SectionTitle'

type Guest = { id: string; name: string; email: string }
type Booking = {
  id: string
  check_in: string
  check_out: string
  status: string
  notes?: string
  guests: Guest
  rooms?: { name: string }
  beds?: { name: string }
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/bookings')
      if (!res.ok) throw new Error('Failed to load bookings')
      const data = await res.json()
      setBookings(data)
    } catch (e: any) {
      setError(e.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  return (
      <Container>
        <Wrapper>
          <SectionTitle>Bookings</SectionTitle>
          {loading ? (
            <Small>Loading bookings...</Small>
          ) : error ? (
            <ErrorText>{error}</ErrorText>
          ) : bookings.length === 0 ? (
            <Small>No bookings yet.</Small>
          ) : (
            <List>
              {bookings.map((b) => (
                <Item key={b.id}>
                  <Row>
                    <Label>Guest</Label>
                    <Value>{b.guests?.name || '—'}</Value>
                  </Row>
                  <Row>
                    <Label>Room/Bed</Label>
                    <Value>
                      {b.beds ? `Bed: ${b.beds.name}` : b.rooms ? `Room: ${b.rooms.name}` : '—'}
                    </Value>
                  </Row>
                  <Row>
                    <Label>Dates</Label>
                    <Value>
                      {new Date(b.check_in).toLocaleDateString()} → {new Date(b.check_out).toLocaleDateString()}
                    </Value>
                  </Row>
                  <Row>
                    <Label>Status</Label>
                    <Status data-status={b.status}>{b.status}</Status>
                  </Row>
                  {b.notes && (
                    <Row>
                      <Label>Notes</Label>
                      <Value>{b.notes}</Value>
                    </Row>
                  )}
                </Item>
              ))}
            </List>
          )}
        </Wrapper>
      </Container>
  )
}

const Wrapper = styled.div`
  padding: 2rem 0;
`
const Small = styled.p`
  opacity: 0.7;
`
const ErrorText = styled.div`
  color: #b91c1c;
`
const List = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
`
const Item = styled.div`
  border: 1px solid rgb(var(--border));
  border-radius: 0.6rem;
  background: rgb(var(--cardBackground));
  padding: 1rem;
`
const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.3rem 0;
`
const Label = styled.div`
  opacity: 0.7;
`
const Value = styled.div``
const Status = styled.div`
  text-transform: capitalize;
  &[data-status='confirmed'] { color: #047857; }
  &[data-status='pending'] { color: #92400e; }
  &[data-status='cancelled'] { color: #b91c1c; }
`

