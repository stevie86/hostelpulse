import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import Container from 'components/Container';
import SectionTitle from 'components/SectionTitle';
import OverTitle from 'components/OverTitle';
import { media } from 'utils/media';
import Button from 'components/Button';
import ButtonGroup from 'components/ButtonGroup';
import { supabase } from '../lib/supabase';

interface Guest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  check_in: string;
  check_out: string;
  room_name?: string;
  bed_name?: string;
}

interface Room {
  id: string;
  name: string;
  type: 'private' | 'dorm';
  max_capacity: number;
  current_occupancy: number;
}

export default function DashboardPage() {
  const [todaysArrivals, setTodaysArrivals] = useState<Guest[]>([]);
  const [todaysDepartures, setTodaysDepartures] = useState<Guest[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    
    // Simulate loading dashboard data
    setTimeout(() => {
      // Sample data for demonstration
      setTodaysArrivals([
        { id: '1', name: 'Alex Johnson', email: 'alex.johnson@email.com', phone: '+1234567890', check_in: '2023-10-01', check_out: '2023-10-05', room_name: 'Room 101' },
        { id: '2', name: 'Maria Garcia', email: 'maria.garcia@email.com', phone: '+34123456789', check_in: '2023-10-01', check_out: '2023-10-03', bed_name: 'Bed 3' },
        { id: '3', name: 'Thomas Müller', email: 'thomas.mueller@email.com', phone: '+491234567890', check_in: '2023-10-01', check_out: '2023-10-07', room_name: 'Room 205' },
      ]);
      
      setTodaysDepartures([
        { id: '4', name: 'Sarah Williams', email: 'sarah.williams@email.com', phone: '+441234567890', check_in: '2023-09-25', check_out: '2023-10-01', room_name: 'Room 301' },
        { id: '5', name: 'Yuki Tanaka', email: 'yuki.tanaka@email.com', phone: '+81123456789', check_in: '2023-09-28', check_out: '2023-10-01', bed_name: 'Bed 7' },
      ]);
      
      setAvailableRooms([
        { id: '1', name: 'Room 102', type: 'private', max_capacity: 2, current_occupancy: 0 },
        { id: '2', name: 'Room 103', type: 'private', max_capacity: 4, current_occupancy: 0 },
        { id: '3', name: 'Dormitory A', type: 'dorm', max_capacity: 12, current_occupancy: 8 },
        { id: '4', name: 'Dormitory B', type: 'dorm', max_capacity: 8, current_occupancy: 3 },
      ]);
      
      setLoading(false);
    }, 800);
  }

  return (
    <>
      <Head>
        <title>HostelPulse — Dashboard</title>
        <meta name="description" content="Your hostel operations dashboard" />
      </Head>
      <Wrapper>
        <Container>
          <Header>
            <OverTitle>dashboard</OverTitle>
            <SectionTitle>Welcome to HostelPulse</SectionTitle>
            <Description>
              Streamline your daily hostel operations with real-time arrivals/departures tracking, 
              smart guest management, and booking oversight that prevents costly double-bookings.
            </Description>
            <ButtonGroup>
              <Button as="a" href="/guests/create">
                Add New Guest
              </Button>
              <Button as="a" href="/bookings/create" transparent>
                Create Booking
              </Button>
              <Button as="a" href="/rooms" transparent>
                Manage Rooms
              </Button>
            </ButtonGroup>
          </Header>
          
          <StatsSection>
            <StatCard>
              <StatValue>12</StatValue>
              <StatLabel>Today's Arrivals</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>8</StatValue>
              <StatLabel>Today's Departures</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>3</StatValue>
              <StatLabel>Available Rooms</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>28%</StatValue>
              <StatLabel>Occupancy Rate</StatLabel>
            </StatCard>
          </StatsSection>
          
          <SectionGrid>
            <Section>
              <SectionHeader>
                <SectionTitle>Today's Arrivals</SectionTitle>
                <Button as="a" href="/guests" transparent small>
                  View All Guests
                </Button>
              </SectionHeader>
              <ArrivalsList>
                {todaysArrivals.map((guest) => (
                  <GuestCard key={guest.id}>
                    <GuestInfo>
                      <GuestName>{guest.name}</GuestName>
                      <GuestContact>{guest.email} • {guest.phone}</GuestContact>
                      <GuestStay>
                        {guest.room_name || guest.bed_name} • {guest.check_in} to {guest.check_out}
                      </GuestStay>
                    </GuestInfo>
                    <ButtonGroup>
                      <Button small>Check In</Button>
                      <Button small transparent>View Details</Button>
                    </ButtonGroup>
                  </GuestCard>
                ))}
              </ArrivalsList>
            </Section>
            
            <Section>
              <SectionHeader>
                <SectionTitle>Today's Departures</SectionTitle>
                <Button as="a" href="/bookings" transparent small>
                  View All Bookings
                </Button>
              </SectionHeader>
              <DeparturesList>
                {todaysDepartures.map((guest) => (
                  <GuestCard key={guest.id}>
                    <GuestInfo>
                      <GuestName>{guest.name}</GuestName>
                      <GuestContact>{guest.email} • {guest.phone}</GuestContact>
                      <GuestStay>
                        {guest.room_name || guest.bed_name} • {guest.check_in} to {guest.check_out}
                      </GuestStay>
                    </GuestInfo>
                    <ButtonGroup>
                      <Button small>Check Out</Button>
                      <Button small transparent>View Details</Button>
                    </ButtonGroup>
                  </GuestCard>
                ))}
              </DeparturesList>
            </Section>
            
            <Section fullWidth>
              <SectionHeader>
                <SectionTitle>Room Availability</SectionTitle>
                <Button as="a" href="/rooms" transparent small>
                  Manage Rooms
                </Button>
              </SectionHeader>
              <RoomsGrid>
                {availableRooms.map((room) => (
                  <RoomCard key={room.id}>
                    <RoomHeader>
                      <RoomName>{room.name}</RoomName>
                      <RoomType>{room.type === 'private' ? 'Private Room' : 'Dormitory'}</RoomType>
                    </RoomHeader>
                    <RoomCapacity>
                      Capacity: {room.current_occupancy}/{room.max_capacity}
                    </RoomCapacity>
                    <OccupancyBar>
                      <OccupancyFill style={{ width: `${(room.current_occupancy / room.max_capacity) * 100}%` }} />
                    </OccupancyBar>
                    <ButtonGroup>
                      <Button small>Add Booking</Button>
                      <Button small transparent>Edit Room</Button>
                    </ButtonGroup>
                  </RoomCard>
                ))}
              </RoomsGrid>
            </Section>
          </SectionGrid>
        </Container>
      </Wrapper>
    </>
  );
}

const Wrapper = styled.div`
  padding: 5rem 0;
  
  ${media('<=tablet')} {
    padding: 3rem 0;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 5rem;
  
  & > *:not(:first-child) {
    margin-top: 1.5rem;
  }
  
  ${media('<=tablet')} {
    margin-bottom: 3rem;
  }
`;

const Description = styled.p`
  font-size: 1.8rem;
  opacity: 0.8;
  max-width: 70rem;
  margin: 0 auto;
  
  ${media('<=tablet')} {
    font-size: 1.6rem;
  }
`;

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-bottom: 5rem;
  
  ${media('<=tablet')} {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-bottom: 3rem;
  }
  
  ${media('<=phone')} {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: rgb(var(--cardBackground));
  border-radius: 0.8rem;
  padding: 2rem;
  text-align: center;
  box-shadow: var(--shadow-md);
`;

const StatValue = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: rgb(var(--primary));
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 1.4rem;
  opacity: 0.8;
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 3rem;
  
  ${media('<=tablet')} {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const Section = styled.div<{ fullWidth?: boolean }>`
  background: rgb(var(--cardBackground));
  border-radius: 0.8rem;
  padding: 2.5rem;
  box-shadow: var(--shadow-md);
  
  ${(p) =>
    p.fullWidth &&
    `
      grid-column: 1 / -1;
    `}
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  ${media('<=tablet')} {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const ArrivalsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const DeparturesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const GuestCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-radius: 0.6rem;
  background: rgba(var(--text), 0.03);
  
  ${media('<=tablet')} {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const GuestInfo = styled.div`
  flex: 1;
  
  & > *:not(:first-child) {
    margin-top: 0.5rem;
  }
`;

const GuestName = styled.div`
  font-weight: bold;
  font-size: 1.6rem;
`;

const GuestContact = styled.div`
  font-size: 1.4rem;
  opacity: 0.8;
`;

const GuestStay = styled.div`
  font-size: 1.4rem;
  opacity: 0.8;
`;

const RoomsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const RoomCard = styled.div`
  background: rgba(var(--text), 0.03);
  border-radius: 0.6rem;
  padding: 1.5rem;
  
  & > *:not(:first-child) {
    margin-top: 1rem;
  }
`;

const RoomHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RoomName = styled.div`
  font-weight: bold;
  font-size: 1.6rem;
`;

const RoomType = styled.div`
  font-size: 1.2rem;
  opacity: 0.7;
  background: rgba(var(--primary), 0.1);
  padding: 0.3rem 0.6rem;
  border-radius: 0.4rem;
`;

const RoomCapacity = styled.div`
  font-size: 1.4rem;
  opacity: 0.8;
`;

const OccupancyBar = styled.div`
  height: 0.8rem;
  background: rgba(var(--text), 0.1);
  border-radius: 0.4rem;
  overflow: hidden;
`;

const OccupancyFill = styled.div`
  height: 100%;
  background: rgb(var(--primary));
  border-radius: 0.4rem;
`;