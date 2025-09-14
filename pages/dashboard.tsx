import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Container from 'components/Container'
import BasicCard from 'components/BasicCard'
import Button from 'components/Button'
import SectionTitle from 'components/SectionTitle'
import { format, isToday } from 'date-fns'

interface Guest {
  id: string
  name: string
  email: string
  phone?: string
}

interface Booking {
  id: string
  check_in: string
  check_out: string
  status: string
  guests: Guest
  rooms?: { name: string }
  beds?: { name: string }
}

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [bookingsRes, guestsRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/guests')
      ])

      if (!bookingsRes.ok || !guestsRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const bookingsData = await bookingsRes.json()
      const guestsData = await guestsRes.json()
      
      setBookings(bookingsData)
      setGuests(guestsData)
    } catch (err) {
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const todayArrivals = bookings.filter(booking => 
    isToday(new Date(booking.check_in)) && booking.status === 'confirmed'
  )

  const todayDepartures = bookings.filter(booking => 
    isToday(new Date(booking.check_out)) && booking.status === 'confirmed'
  )

  if (loading) {
    return (
      <Container>
        <DashboardWrapper>
          <SectionTitle>Dashboard</SectionTitle>
          <LoadingText>Loading dashboard...</LoadingText>
        </DashboardWrapper>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <DashboardWrapper>
          <SectionTitle>Dashboard</SectionTitle>
          <ErrorText>{error}</ErrorText>
          <Button onClick={fetchData}>Retry</Button>
        </DashboardWrapper>
      </Container>
    )
  }

  return (
    <Container>
      <DashboardWrapper>
        <Header>
          <SectionTitle>Dashboard</SectionTitle>
          <DateText>Today, {format(new Date(), 'MMMM d, yyyy')}</DateText>
        </Header>

        <CardsGrid>
          <BasicCard>
            <CardHeader>
              <CardTitle>Today's Arrivals</CardTitle>
              <CountBadge>{todayArrivals.length}</CountBadge>
            </CardHeader>
            {todayArrivals.length === 0 ? (
              <EmptyState>No arrivals scheduled for today</EmptyState>
            ) : (
              <BookingsList>
                {todayArrivals.map(booking => (
                  <BookingItem key={booking.id}>
                    <GuestName>{booking.guests.name}</GuestName>
                    <RoomInfo>
                      {booking.beds ? `Bed: ${booking.beds.name}` : 
                       booking.rooms ? `Room: ${booking.rooms.name}` : 'No room assigned'}
                    </RoomInfo>
                  </BookingItem>
                ))}
              </BookingsList>
            )}
          </BasicCard>

          <BasicCard>
            <CardHeader>
              <CardTitle>Today's Departures</CardTitle>
              <CountBadge>{todayDepartures.length}</CountBadge>
            </CardHeader>
            {todayDepartures.length === 0 ? (
              <EmptyState>No departures scheduled for today</EmptyState>
            ) : (
              <BookingsList>
                {todayDepartures.map(booking => (
                  <BookingItem key={booking.id}>
                    <GuestName>{booking.guests.name}</GuestName>
                    <RoomInfo>
                      {booking.beds ? `Bed: ${booking.beds.name}` : 
                       booking.rooms ? `Room: ${booking.rooms.name}` : 'No room assigned'}
                    </RoomInfo>
                  </BookingItem>
                ))}
              </BookingsList>
            )}
          </BasicCard>

          <BasicCard>
            <CardHeader>
              <CardTitle>Recent Guests</CardTitle>
              <CountBadge>{guests.length}</CountBadge>
            </CardHeader>
            {guests.length === 0 ? (
              <EmptyState>No guests yet. <a href="/guests">Add your first guest</a></EmptyState>
            ) : (
              <BookingsList>
                {guests.slice(0, 5).map(guest => (
                  <BookingItem key={guest.id}>
                    <GuestName>{guest.name}</GuestName>
                    <RoomInfo>{guest.email}</RoomInfo>
                  </BookingItem>
                ))}
              </BookingsList>
            )}
          </BasicCard>

          <BasicCard>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <ActionsGrid>
              <ActionButton href="/guests">Add Guest</ActionButton>
              <ActionButton href="/bookings">New Booking</ActionButton>
              <ActionButton href="/rooms">Manage Rooms</ActionButton>
            </ActionsGrid>
          </BasicCard>
        </CardsGrid>
      </DashboardWrapper>
    </Container>
  )
}

const DashboardWrapper = styled.div`
  padding: 2rem 0;
`

const Header = styled.div`
  margin-bottom: 2rem;
`

const DateText = styled.p`
  margin: 0.5rem 0 0;
  opacity: 0.7;
  font-size: 1.4rem;
`

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.6rem;
  font-weight: 600;
`

const CountBadge = styled.span`
  background: rgb(var(--primary));
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 1.2rem;
  font-size: 1.2rem;
  font-weight: 600;
  min-width: 2.4rem;
  text-align: center;
`

const BookingsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const BookingItem = styled.div`
  padding: 1rem;
  background: rgb(var(--cardBackground));
  border-radius: 0.6rem;
  border: 1px solid rgb(var(--border));
`

const GuestName = styled.div`
  font-weight: 600;
  margin-bottom: 0.3rem;
`

const RoomInfo = styled.div`
  font-size: 1.3rem;
  opacity: 0.7;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  opacity: 0.6;
  
  a {
    color: rgb(var(--primary));
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
`

const ActionsGrid = styled.div`
  display: grid;
  gap: 1rem;
`

const ActionButton = styled.a`
  display: block;
  padding: 1rem;
  background: rgb(var(--primary));
  color: white;
  text-decoration: none;
  border-radius: 0.6rem;
  text-align: center;
  font-weight: 500;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
`

const LoadingText = styled.div`
  text-align: center;
  padding: 4rem;
  opacity: 0.6;
`

const ErrorText = styled.div`
  color: #b91c1c;
  text-align: center;
  margin-bottom: 2rem;
`
