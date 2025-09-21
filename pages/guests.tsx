import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import Button from 'components/Button'
import Container from 'components/Container'
import SectionTitle from 'components/SectionTitle'

type Guest = {
  id: string
  name: string
  email: string
  phone?: string
  notes?: string
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/guests')
      if (!res.ok) throw new Error('Failed to load guests')
      const data = await res.json()
      setGuests(data)
    } catch (e: any) {
      setError(e.message || 'Failed to load guests')
    } finally {
      setLoading(false)
    }
  }

  const summary = useMemo(() => {
    const total = guests.length
    const withNotes = guests.filter((guest) => guest.notes).length
    return { total, withNotes }
  }, [guests])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to create guest')
      setForm({ name: '', email: '', phone: '', notes: '' })
      await load()
    } catch (e: any) {
      setError(e.message || 'Failed to create guest')
    } finally {
      setSubmitting(false)
    }
  }

  return (
      <Container>
        <Wrapper>
          <Header>
            <SectionTitle>Guests</SectionTitle>
            <Small>Manage your guest list</Small>
          </Header>

          <ActionBar>
            <Stats>
              <StatBubble data-tone="ok">Total guests: {summary.total}</StatBubble>
              <StatBubble data-tone="info">With notes: {summary.withNotes}</StatBubble>
            </Stats>
            <Button type="button" onClick={load} disabled={loading}>
              {loading ? 'Refreshing…' : 'Refresh list'}
            </Button>
          </ActionBar>

          <Card>
            <CardTitle>Add Guest</CardTitle>
            <Form onSubmit={onSubmit}>
              <InputRow>
                <Input
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </InputRow>
              <InputRow>
                <Input
                  placeholder="Phone (optional)"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <Input
                  placeholder="Notes (optional)"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </InputRow>
              <Button as="button" type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Guest'}
              </Button>
            </Form>
            {error && <ErrorText>{error}</ErrorText>}
          </Card>

          <SectionTitle>All Guests</SectionTitle>
          {loading ? (
            <Small>Loading guests...</Small>
          ) : guests.length === 0 ? (
            <Small>No guests yet.</Small>
          ) : (
            <Grid>
              {guests.map((g) => (
                <GuestCard key={g.id}>
                  <GuestName>{g.name}</GuestName>
                  <GuestMeta>{g.email}</GuestMeta>
                  {g.phone && <GuestMeta>{g.phone}</GuestMeta>}
                  {g.notes && <GuestNotes>{g.notes}</GuestNotes>}
                </GuestCard>
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

const Header = styled.div`
  margin-bottom: 1.5rem;
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

const Card = styled.div`
  background: rgb(var(--cardBackground));
  border: 1px solid rgb(var(--border));
  border-radius: 0.8rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
`

const CardTitle = styled.h3`
  margin: 0 0 1rem;
`

const Form = styled.form`
  display: grid;
  gap: 1rem;
`

const InputRow = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
`

const Input = styled.input`
  padding: 0.8rem 1rem;
  border: 1px solid rgb(var(--border));
  border-radius: 0.6rem;
  background: rgb(var(--cardBackground));
  color: rgb(var(--text));
`

const ErrorText = styled.div`
  color: #b91c1c;
  margin-top: 1rem;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
`

const GuestCard = styled.div`
  border: 1px solid rgb(var(--border));
  border-radius: 0.6rem;
  padding: 1rem;
`

const GuestName = styled.div`
  font-weight: 600;
`

const GuestMeta = styled.div`
  font-size: 1.3rem;
  opacity: 0.8;
`

const GuestNotes = styled.div`
  margin-top: 0.5rem;
  font-size: 1.3rem;
  opacity: 0.7;
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
