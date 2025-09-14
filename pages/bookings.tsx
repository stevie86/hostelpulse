import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Container from 'components/Container'
import SectionTitle from 'components/SectionTitle'
import Button from 'components/Button'
import { addNightsSaved } from '../utils/metrics'

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
  const [guests, setGuests] = useState<Guest[]>([])
  const [rooms, setRooms] = useState<{ id: string; name: string; type: string; beds?: { id: string; name: string }[] }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ guest_id: '', room_id: '', bed_id: '', check_in: '', check_out: '', status: 'confirmed', notes: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{ check_in: string; check_out: string; status: string; notes: string }>({ check_in: '', check_out: '', status: 'confirmed', notes: '' })

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [b, g, r] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/guests'),
        fetch('/api/rooms')
      ])
      if (!b.ok || !g.ok || !r.ok) throw new Error('Failed to load bookings')
      setBookings(await b.json())
      setGuests(await g.json())
      setRooms(await r.json())
    } catch (e: any) {
      setError(e.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  async function createBooking(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setError(null)
    try {
      const body: any = {
        guest_id: form.guest_id,
        room_id: form.bed_id ? undefined : form.room_id || undefined,
        bed_id: form.bed_id || undefined,
        check_in: form.check_in,
        check_out: form.check_out,
        status: form.status,
        notes: form.notes,
      }
      const res = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to create booking')
      // increment nights saved by number of nights booked (at least 1)
      try {
        const nights = Math.max(1, Math.round((new Date(form.check_out).getTime() - new Date(form.check_in).getTime()) / 86400000))
        addNightsSaved(nights)
      } catch {}
      setForm({ guest_id: '', room_id: '', bed_id: '', check_in: '', check_out: '', status: 'confirmed', notes: '' })
      await load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setCreating(false)
    }
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingId) return
    try {
      const res = await fetch('/api/bookings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingId, check_in: editForm.check_in, check_out: editForm.check_out, status: editForm.status, notes: editForm.notes }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to update booking')
      setEditingId(null)
      await load()
    } catch (e: any) {
      setError(e.message || 'Failed to update booking')
    }
  }

  const bedsByRoom = rooms.find(r => r.id === form.room_id)?.beds || []

  return (
      <Container>
        <Wrapper>
          <SectionTitle>Bookings</SectionTitle>
          <Card>
            <H3>New Booking</H3>
            <Form onSubmit={createBooking}>
              <FieldRow>
                <Col>
                  <FieldLabel>Guest</FieldLabel>
                  <Select value={form.guest_id} onChange={(e) => setForm({ ...form, guest_id: e.target.value })} required>
                    <option value="">Select guest…</option>
                    {guests.map(g => <option key={g.id} value={g.id}>{g.name} ({g.email})</option>)}
                  </Select>
                </Col>
                <Col>
                  <FieldLabel>Room</FieldLabel>
                  <Select value={form.room_id} onChange={(e) => setForm({ ...form, room_id: e.target.value, bed_id: '' })}>
                    <option value="">(optional) Select room…</option>
                    {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </Select>
                </Col>
                <Col>
                  <FieldLabel>Bed (for dorm)</FieldLabel>
                  <Select value={form.bed_id} onChange={(e) => setForm({ ...form, bed_id: e.target.value })}>
                    <option value="">(optional) Select bed…</option>
                    {bedsByRoom.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </Select>
                </Col>
              </FieldRow>
              <FieldRow>
                <Col>
                  <FieldLabel>Check‑in</FieldLabel>
                  <Input type="date" value={form.check_in} onChange={(e) => setForm({ ...form, check_in: e.target.value })} required />
                </Col>
                <Col>
                  <FieldLabel>Check‑out</FieldLabel>
                  <Input type="date" value={form.check_out} onChange={(e) => setForm({ ...form, check_out: e.target.value })} required />
                </Col>
                <Col>
                  <FieldLabel>Status</FieldLabel>
                  <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </Select>
                </Col>
              </FieldRow>
              <FieldLabel>Notes</FieldLabel>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="(optional)" />
              <ActionsRow>
                <Button as="button" type="submit" disabled={creating}>{creating ? 'Creating…' : 'Create booking'}</Button>
              </ActionsRow>
            </Form>
          </Card>
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
                    {editingId === b.id ? (
                      <EditRow>
                        <input type="date" value={editForm.check_in} onChange={(e) => setEditForm({ ...editForm, check_in: e.target.value })} />
                        <span>→</span>
                        <input type="date" value={editForm.check_out} onChange={(e) => setEditForm({ ...editForm, check_out: e.target.value })} />
                      </EditRow>
                    ) : (
                      <Value>
                        {new Date(b.check_in).toLocaleDateString()} → {new Date(b.check_out).toLocaleDateString()}
                      </Value>
                    )}
                  </Row>
                  <Row>
                    <Label>Status</Label>
                    {editingId === b.id ? (
                      <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    ) : (
                      <Status data-status={b.status}>{b.status}</Status>
                    )}
                  </Row>
                  <Row>
                    <Label>Notes</Label>
                    {editingId === b.id ? (
                      <input value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} placeholder="(optional)" />
                    ) : (
                      <Value>{b.notes || '—'}</Value>
                    )}
                  </Row>
                  <ActionsInline>
                    {editingId === b.id ? (
                      <>
                        <SmallButton as="button" onClick={saveEdit}>Save</SmallButton>
                        <SmallButton as="button" onClick={() => setEditingId(null)}>Cancel</SmallButton>
                      </>
                    ) : (
                      <SmallButton as="button" onClick={() => { setEditingId(b.id); setEditForm({ check_in: b.check_in.slice(0,10), check_out: b.check_out.slice(0,10), status: b.status, notes: b.notes || '' }) }}>Edit</SmallButton>
                    )}
                  </ActionsInline>
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
const H3 = styled.h3` margin: 0 0 .6rem; `
const Card = styled.div` border:1px solid rgb(var(--border)); border-radius:.8rem; padding:1.2rem; margin: 0 0 1.6rem; background: rgb(var(--cardBackground)); `
const Form = styled.form` display:grid; gap:.8rem; `
const FieldRow = styled.div` display:grid; gap:.8rem; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); `
const Col = styled.div``
const FieldLabel = styled.label` font-size:1.3rem; opacity:.85; `
const Select = styled.select` width:100%; padding: .8rem 1rem; border:1px solid rgb(var(--border)); border-radius:.6rem; background: rgb(var(--cardBackground)); color: rgb(var(--text)); `
const Input = styled.input` width:100%; padding: .8rem 1rem; border:1px solid rgb(var(--border)); border-radius:.6rem; background: rgb(var(--cardBackground)); color: rgb(var(--text)); `
const ActionsRow = styled.div` margin-top: .4rem; `
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
const ActionsInline = styled.div`
  display: flex;
  gap: .6rem;
  margin-top: .6rem;
`
const SmallButton = styled(Button)`
  padding: .4rem .8rem;
`
const EditRow = styled.div`
  display: flex;
  align-items: center;
  gap: .6rem;
  input, select { padding: .4rem .6rem; }
`
