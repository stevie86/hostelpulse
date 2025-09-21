import { isToday } from 'date-fns'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Container from 'components/Container'
import SectionTitle from 'components/SectionTitle'

type Booking = {
  id: string
  check_in: string
  check_out: string
  status: string
  rooms?: { name: string }
  beds?: { name: string }
}

export default function HousekeepingPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/bookings')
      if (!res.ok) throw new Error('Failed to load bookings')
      const data = await res.json()
      setBookings(data)
    } catch (e: any) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  const todaysDepartures = bookings.filter(b => isToday(new Date(b.check_out)) && b.status === 'confirmed')

  return (
    <Container>
      <Wrapper>
        <SectionTitle>Housekeeping</SectionTitle>
        {loading ? (
          <Small>Loading…</Small>
        ) : error ? (
          <ErrorText>{error}</ErrorText>
        ) : (
          <List>
            {todaysDepartures.length === 0 ? (
              <Small>No rooms to clean right now.</Small>
            ) : (
              todaysDepartures.map((b) => (
                <Item key={b.id}>
                  <Name>{b.beds ? `Bed: ${b.beds.name}` : b.rooms ? `Room: ${b.rooms.name}` : 'Unassigned'}</Name>
                  <Note>Departed today — ready to clean</Note>
                </Item>
              ))
            )}
          </List>
        )}
      </Wrapper>
    </Container>
  )
}

const Wrapper = styled.div` padding: 2rem 0; `
const Small = styled.p` opacity: 0.8; `
const ErrorText = styled.div` color: #b91c1c; `
const List = styled.div` display: grid; gap: 0.8rem; `
const Item = styled.div` border: 1px solid rgb(var(--border)); border-radius: 0.6rem; padding: 1rem; `
const Name = styled.div` font-weight: 600; `
const Note = styled.div` opacity: 0.8; font-size: 1.3rem; `
