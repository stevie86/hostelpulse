import { isToday } from 'date-fns'
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import Button from 'components/Button'
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

  const summary = useMemo(() => {
    if (!bookings.length) {
      return { total: 0, confirmed: 0, pending: 0, arrivalsToday: 0, departuresToday: 0 }
    }

    let confirmed = 0
    let pending = 0
    let arrivalsToday = 0
    let departuresToday = 0
    bookings.forEach((booking) => {
      if (booking.status === 'confirmed') confirmed += 1
      if (booking.status === 'pending') pending += 1
      if (isToday(new Date(booking.check_in))) arrivalsToday += 1
      if (isToday(new Date(booking.check_out))) departuresToday += 1
    })
    return {
      total: bookings.length,
      confirmed,
      pending,
      arrivalsToday,
      departuresToday,
    }
  }, [bookings])

  return (
      <Container>
        <Wrapper>
          <SectionTitle>Bookings</SectionTitle>
          <ActionBar>
            <Stats>
              <StatBubble>All: {summary.total}</StatBubble>
              <StatBubble data-tone="ok">Confirmed: {summary.confirmed}</StatBubble>
              <StatBubble data-tone="warn">Pending: {summary.pending}</StatBubble>
              <StatBubble data-tone="info">Arrivals today: {summary.arrivalsToday}</StatBubble>
              <StatBubble data-tone="info">Departures today: {summary.departuresToday}</StatBubble>
            </Stats>
            <Button onClick={load} disabled={loading} type="button">
              {loading ? 'Refreshing…' : 'Refresh list'}
            </Button>
          </ActionBar>
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
                  {b.status === 'pending' && (
                    <Callout data-tone="warn">Action needed: pending confirmation</Callout>
                  )}
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
const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
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
const Callout = styled.div`
  margin-top: 0.6rem;
  padding: 0.6rem 0.8rem;
  border-radius: 0.6rem;
  font-size: 1.3rem;
  background: rgba(251, 191, 36, 0.15);
  color: #92400e;

  &[data-tone='warn'] {
    background: rgba(251, 191, 36, 0.15);
    color: #92400e;
  }
`
const Stats = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
`
const StatBubble = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  font-size: 1.2rem;
  background: rgba(59, 130, 246, 0.1);
  color: #1d4ed8;

  &[data-tone='ok'] {
    background: rgba(16, 185, 129, 0.12);
    color: #047857;
  }
  &[data-tone='warn'] {
    background: rgba(251, 191, 36, 0.2);
    color: #92400e;
  }
  &[data-tone='info'] {
    background: rgba(59, 130, 246, 0.1);
    color: #1d4ed8;
  }
`
