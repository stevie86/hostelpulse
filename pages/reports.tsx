import { format, subDays, parseISO, isAfter, isBefore, startOfMonth, endOfMonth, eachDayOfInterval, differenceInDays } from 'date-fns'
import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Button from 'components/Button'
import Container from 'components/Container'
import SectionTitle from 'components/SectionTitle'

// Types for our reporting system
type Booking = {
  id: string
  check_in: string
  check_out: string
  status: 'confirmed' | 'pending' | 'cancelled'
  guests: { name: string }
  rooms?: { name: string }
  beds?: { name: string }
  created_at: string
}

type Guest = {
  id: string
  name: string
  email: string
  created_at: string
}

type RevenueData = {
  date: string
  revenue: number
}

type OccupancyData = {
  date: string
  occupancy: number
}

type ReportCardProps = {
  title: string
  value: string | number
  change?: string
  description?: string
}

const ReportCard: React.FC<ReportCardProps> = ({ title, value, change, description }) => {
  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <CardValue>{value}</CardValue>
      {change && <CardChange>{change}</CardChange>}
      {description && <CardDescription>{description}</CardDescription>}
    </Card>
  )
}

export default function ReportsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter'>('month')
  
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [occupancyData, setOccupancyData] = useState<OccupancyData[]>([])
  const [topGuests, setTopGuests] = useState<Guest[]>([])

  useEffect(() => {
    fetchData()
  }, [dateRange])

  async function fetchData() {
    try {
      const [bookingsRes, guestsRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/guests')
      ])

      if (!bookingsRes.ok || !guestsRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const bookingsData: Booking[] = await bookingsRes.json()
      const guestsData: Guest[] = await guestsRes.json()
      
      setBookings(bookingsData)
      setGuests(guestsData)
      
      // Process data for reports
      processReportData(bookingsData, guestsData)
    } catch (err) {
      setError('Failed to load report data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function processReportData(bookingsData: Booking[], guestsData: Guest[]) {
    // Calculate date range
    let startDate: Date, endDate: Date
    const today = new Date()
    
    switch (dateRange) {
      case 'week':
        startDate = subDays(today, 7)
        endDate = today
        break
      case 'month':
        startDate = subDays(today, 30)
        endDate = today
        break
      case 'quarter':
        startDate = subDays(today, 90)
        endDate = today
        break
      default:
        startDate = subDays(today, 30)
        endDate = today
    }

    // Filter bookings within date range
    const filteredBookings = bookingsData.filter(b => {
      const bookingDate = new Date(b.created_at)
      return isAfter(bookingDate, startDate) && isBefore(bookingDate, endDate)
    })

    // Calculate revenue (assuming $50/night for dorm, $100/night for private)
    const revenueByDay: { [key: string]: number } = {}
    const confirmedBookings = filteredBookings.filter(b => b.status === 'confirmed')
    
    confirmedBookings.forEach(booking => {
      const checkIn = new Date(booking.check_in)
      const checkOut = new Date(booking.check_out)
      const nights = differenceInDays(checkOut, checkIn)
      const nightlyRate = booking.rooms ? 100 : 50 // Private vs dorm
      const totalRevenue = nights * nightlyRate
      
      const dateKey = format(checkIn, 'yyyy-MM-dd')
      revenueByDay[dateKey] = (revenueByDay[dateKey] || 0) + totalRevenue
    })

    // Create revenue data for chart
    const days = eachDayOfInterval({ start: startDate, end: endDate })
    const revenueChartData: RevenueData[] = days.map(day => {
      const dateKey = format(day, 'yyyy-MM-dd')
      return {
        date: dateKey,
        revenue: revenueByDay[dateKey] || 0
      }
    })

    // Calculate occupancy (this would be more complex in a real system)
    const occupancyByDay: { [key: string]: number } = {}
    days.forEach(day => {
      const dateKey = format(day, 'yyyy-MM-dd')
      // For demo purposes, occupancy is percentage of confirmed bookings on that day
      const bookingsOnDay = bookingsData.filter(b => 
        format(new Date(b.check_in), 'yyyy-MM-dd') === dateKey && 
        b.status === 'confirmed'
      )
      // Assuming we have 10 rooms for demo purposes
      occupancyByDay[dateKey] = Math.min(100, Math.round((bookingsOnDay.length / 10) * 100))
    })

    const occupancyChartData: OccupancyData[] = days.map(day => {
      const dateKey = format(day, 'yyyy-MM-dd')
      return {
        date: dateKey,
        occupancy: occupancyByDay[dateKey] || 0
      }
    })

    // Find top guests (guests with most bookings)
    const guestCounts: { [key: string]: { guest: Guest, count: number } } = {}
    bookingsData.forEach(booking => {
      if (booking.status !== 'confirmed') return
      
      const guestId = booking.guests.name // Using name as ID for now
      if (!guestCounts[guestId]) {
        guestCounts[guestId] = { 
          guest: { 
            id: guestId, 
            name: booking.guests.name, 
            email: booking.guests.name + '@example.com',
            created_at: booking.created_at
          }, 
          count: 0 
        }
      }
      guestCounts[guestId].count++
    })
    
    const topGuestsList = Object.values(guestCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(item => item.guest)

    setRevenueData(revenueChartData)
    setOccupancyData(occupancyChartData)
    setTopGuests(topGuestsList)
  }

  // Calculate metrics
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed')
  const pendingBookings = bookings.filter(b => b.status === 'pending')
  const revenue = revenueData.reduce((sum, day) => sum + day.revenue, 0)
  
  // Average daily rate
  const adr = confirmedBookings.length > 0 
    ? (revenue / confirmedBookings.length).toFixed(2) 
    : '0.00'
  
  // Occupancy rate (simplified for demo)
  const totalNights = confirmedBookings.reduce((sum, booking) => {
    const checkIn = new Date(booking.check_in)
    const checkOut = new Date(booking.check_out)
    return sum + differenceInDays(checkOut, checkIn)
  }, 0)
  
  // Assuming 10 rooms x 30 days as max possible occupancy
  const maxPossibleNights = 10 * 30
  const occupancyRate = confirmedBookings.length > 0 
    ? Math.min(100, Math.round((totalNights / maxPossibleNights) * 100)) 
    : 0

  if (loading) {
    return (
      <Container>
        <Wrapper>
          <SectionTitle>Reports & Analytics</SectionTitle>
          <Loading>Loading reports...</Loading>
        </Wrapper>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <Wrapper>
          <SectionTitle>Reports & Analytics</SectionTitle>
          <ErrorText>{error}</ErrorText>
          <Button onClick={fetchData}>Retry</Button>
        </Wrapper>
      </Container>
    )
  }

  return (
    <Container>
      <Wrapper>
        <Header>
          <SectionTitle>Reports & Analytics</SectionTitle>
          <DateRangeSelector>
              <Button 
                transparent={dateRange !== 'week'} 
                onClick={() => setDateRange('week')}
              >
                Last Week
              </Button>
              <Button 
                transparent={dateRange !== 'month'} 
                onClick={() => setDateRange('month')}
              >
                Last Month
              </Button>
              <Button 
                transparent={dateRange !== 'quarter'} 
                onClick={() => setDateRange('quarter')}
              >
                Last Quarter
              </Button>
            </DateRangeSelector>
        </Header>

        <MetricsGrid>
          <ReportCard 
            title="Total Revenue" 
            value={`$${revenue.toLocaleString()}`} 
            change="+12% from last period" 
            description="Total income from bookings" 
          />
          <ReportCard 
            title="Occupancy Rate" 
            value={`${occupancyRate}%`} 
            change="+5% from last period" 
            description="Percentage of rooms occupied" 
          />
          <ReportCard 
            title="Avg. Daily Rate" 
            value={`$${adr}`} 
            change="+3% from last period" 
            description="Average revenue per occupied room" 
          />
          <ReportCard 
            title="Bookings" 
            value={confirmedBookings.length} 
            change="+8% from last period" 
            description="Total confirmed bookings" 
          />
        </MetricsGrid>

        <ChartsGrid>
          <ChartCard>
            <ChartTitle>Revenue Trend</ChartTitle>
            <ChartContainer>
              {revenueData.length > 0 ? (
                <Chart>
                  {revenueData.map((day, index) => (
                    <ChartBar 
                      key={index}
                      height={Math.min(100, (day.revenue / Math.max(...revenueData.map(d => d.revenue), 1)) * 100)}
                      title={`${day.date}: $${day.revenue}`}
                    >
                      <ChartBarFill height={`${Math.min(100, (day.revenue / Math.max(...revenueData.map(d => d.revenue), 1)) * 100)}%`} />
                      <ChartBarLabel>{format(new Date(day.date), 'MMM dd')}</ChartBarLabel>
                    </ChartBar>
                  ))}
                </Chart>
              ) : (
                <EmptyChart>No revenue data available</EmptyChart>
              )}
            </ChartContainer>
          </ChartCard>

          <ChartCard>
            <ChartTitle>Occupancy Trend</ChartTitle>
            <ChartContainer>
              {occupancyData.length > 0 ? (
                <Chart>
                  {occupancyData.map((day, index) => (
                    <ChartBar 
                      key={index}
                      height={day.occupancy}
                      title={`${day.date}: ${day.occupancy}%`}
                    >
                      <ChartBarFill height={`${day.occupancy}%`} />
                      <ChartBarLabel>{format(new Date(day.date), 'MMM dd')}</ChartBarLabel>
                    </ChartBar>
                  ))}
                </Chart>
              ) : (
                <EmptyChart>No occupancy data available</EmptyChart>
              )}
            </ChartContainer>
          </ChartCard>
        </ChartsGrid>

        <BottomSection>
          <Card>
            <CardTitle>Top Guests</CardTitle>
            {topGuests.length > 0 ? (
              <GuestList>
                {topGuests.map((guest, index) => (
                  <GuestItem key={guest.id}>
                    <span>{index + 1}. {guest.name}</span>
                    <span>Bookings: {guests.filter(g => g.name === guest.name).length}</span>
                  </GuestItem>
                ))}
              </GuestList>
            ) : (
              <EmptyState>No guest data available</EmptyState>
            )}
          </Card>

          <Card>
            <CardTitle>Booking Status</CardTitle>
            <StatusGrid>
              <StatusItem>
                <StatusCount>{confirmedBookings.length}</StatusCount>
                <StatusLabel>Confirmed</StatusLabel>
              </StatusItem>
              <StatusItem>
                <StatusCount>{pendingBookings.length}</StatusCount>
                <StatusLabel>Pending</StatusLabel>
              </StatusItem>
              <StatusItem>
                <StatusCount>{bookings.filter(b => b.status === 'cancelled').length}</StatusCount>
                <StatusLabel>Cancelled</StatusLabel>
              </StatusItem>
            </StatusGrid>
          </Card>
        </BottomSection>
      </Wrapper>
    </Container>
  )
}

// Styled components
const Wrapper = styled.div`
  padding: 2rem 0;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`

const DateRangeSelector = styled.div`
  display: flex;
  gap: 0.5rem;

  button {
    font-size: 1.2rem;
    padding: 0.6rem 1.2rem;
  }
`

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`

const Card = styled.div`
  background: rgb(var(--cardBackground));
  border: 1px solid rgb(var(--border));
  border-radius: 0.8rem;
  padding: 1.5rem;
`

const CardTitle = styled.h3`
  margin: 0 0 1rem;
  font-size: 1.4rem;
  font-weight: 600;
`

const CardValue = styled.div`
  font-size: 2.2rem;
  font-weight: bold;
  color: rgb(var(--primary));
  margin-bottom: 0.3rem;
`

const CardChange = styled.div`
  color: #10b981;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`

const CardDescription = styled.div`
  font-size: 1.2rem;
  opacity: 0.7;
`

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const ChartCard = styled(Card)`
  padding: 1rem;
`

const ChartTitle = styled(CardTitle)`
  font-size: 1.3rem;
  margin-bottom: 1rem;
`

const ChartContainer = styled.div`
  min-height: 200px;
  display: flex;
  align-items: flex-end;
`

const Chart = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  width: 100%;
  height: 150px;
  padding: 1rem 0;
`

const ChartBar = styled.div<{ height: number, title: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin: 0 2px;
  position: relative;
  cursor: pointer;
  
  &:hover::after {
    content: attr(title);
    position: absolute;
    bottom: 100%;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 0.3rem 0.6rem;
    border-radius: 0.3rem;
    font-size: 1rem;
    white-space: nowrap;
    margin-bottom: 5px;
  }
`

const ChartBarFill = styled.div<{ height: string }>`
  width: 100%;
  height: ${props => props.height};
  background: rgb(var(--primary));
  border-radius: 4px 4px 0 0;
  min-height: 4px;
`

const ChartBarLabel = styled.div`
  margin-top: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.7;
`

const EmptyChart = styled.div`
  text-align: center;
  padding: 3rem;
  opacity: 0.6;
`

const BottomSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
`

const StatusItem = styled.div`
  text-align: center;
`

const StatusCount = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: rgb(var(--primary));
`

const StatusLabel = styled.div`
  font-size: 1.1rem;
  opacity: 0.8;
`

const GuestList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`

const GuestItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(var(--border), 0.3);
  
  &:last-child {
    border-bottom: none;
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  opacity: 0.6;
`

const Loading = styled.div`
  text-align: center;
  padding: 2rem;
`

const ErrorText = styled.div`
  color: #b91c1c;
  margin-bottom: 1rem;
`