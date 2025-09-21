import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import Button from 'components/Button'
import Container from 'components/Container'
import SectionTitle from 'components/SectionTitle'

type Bed = { id: string; name: string }
type Room = { id: string; name: string; type: 'private' | 'dorm'; max_capacity: number; beds?: Bed[] }

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/rooms')
      if (!res.ok) throw new Error('Failed to load rooms')
      const data = await res.json()
      setRooms(data)
    } catch (e: any) {
      setError(e.message || 'Failed to load rooms')
    } finally {
      setLoading(false)
    }
  }

  const summary = useMemo(() => {
    if (!rooms.length) return { total: 0, beds: 0 }
    const totalBeds = rooms.reduce((sum, room) => sum + (room.beds?.length ?? 0), 0)
    return { total: rooms.length, beds: totalBeds }
  }, [rooms])

  return (
      <Container>
        <Wrapper>
          <SectionTitle>Rooms</SectionTitle>
          <ActionBar>
            <Stats>
              <StatBubble data-tone="ok">Rooms: {summary.total}</StatBubble>
              <StatBubble data-tone="info">Beds: {summary.beds}</StatBubble>
            </Stats>
            <Button type="button" onClick={load} disabled={loading}>
              {loading ? 'Refreshing…' : 'Refresh list'}
            </Button>
          </ActionBar>
          {loading ? (
            <Small>Loading rooms...</Small>
          ) : error ? (
            <ErrorText>{error}</ErrorText>
          ) : rooms.length === 0 ? (
            <Small>No rooms yet.</Small>
          ) : (
            <Grid>
              {rooms.map((r) => (
                <RoomCard key={r.id}>
                  <TitleRow>
                    <Name>{r.name}</Name>
                    <Type data-type={r.type}>{r.type}</Type>
                  </TitleRow>
                  <Meta>Capacity: {r.max_capacity}</Meta>
                  {r.beds && r.beds.length > 0 && (
                    <Beds>
                      {r.beds.map((b) => (
                        <BedTag key={b.id}>{b.name}</BedTag>
                      ))}
                    </Beds>
                  )}
                </RoomCard>
              ))}
            </Grid>
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
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
`
const RoomCard = styled.div`
  border: 1px solid rgb(var(--border));
  border-radius: 0.6rem;
  background: rgb(var(--cardBackground));
  padding: 1rem;
`
const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`
const Name = styled.div`
  font-weight: 600;
`
const Type = styled.div`
  text-transform: capitalize;
  &[data-type='dorm'] { color: #1d4ed8; }
  &[data-type='private'] { color: #065f46; }
`
const Meta = styled.div`
  margin-top: 0.3rem;
  opacity: 0.8;
`
const Beds = styled.div`
  margin-top: 0.6rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
`
const BedTag = styled.span`
  background: rgba(0, 0, 0, 0.06);
  border-radius: 0.4rem;
  padding: 0.2rem 0.6rem;
  font-size: 1.2rem;
`

const Stats = styled.div`
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
`

const StatBubble = styled.span`
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  font-size: 1.2rem;
  background: rgba(59, 130, 246, 0.1);
  color: #1d4ed8;

  &[data-tone='ok'] {
    background: rgba(16, 185, 129, 0.12);
    color: #047857;
  }

  &[data-tone='info'] {
    background: rgba(59, 130, 246, 0.1);
    color: #1d4ed8;
  }
`
