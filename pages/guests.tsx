import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Container from 'components/Container'
import BasicCard from 'components/BasicCard'
import Button from 'components/Button'
import Input from 'components/Input'
import SectionTitle from 'components/SectionTitle'
import AuthGuard from 'components/AuthGuard'
import { Guest } from '../types'

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchGuests()
  }, [])

  async function fetchGuests() {
    try {
      const response = await fetch('/api/guests')
      if (!response.ok) throw new Error('Failed to fetch guests')
      const data = await response.json()
      setGuests(data)
    } catch (err) {
      setError('Failed to load guests')
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(guest: Guest) {
    setEditingGuest(guest)
    setFormData({
      name: guest.name,
      email: guest.email,
      phone: guest.phone || '',
      notes: guest.notes || ''
    })
    setShowForm(true)
  }

  function handleAdd() {
    setEditingGuest(null)
    setFormData({ name: '', email: '', phone: '', notes: '' })
    setShowForm(true)
  }

  function handleCancel() {
    setShowForm(false)
    setEditingGuest(null)
    setFormData({ name: '', email: '', phone: '', notes: '' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const url = '/api/guests'
      const method = editingGuest ? 'PUT' : 'POST'
      const body = editingGuest 
        ? { ...formData, id: editingGuest.id }
        : formData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!response.ok) throw new Error('Failed to save guest')

      await fetchGuests()
      handleCancel()
    } catch (err) {
      setError('Failed to save guest')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <Container>
          <LoadingText>Loading guests...</LoadingText>
        </Container>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <Container>
        <PageWrapper>
          <Header>
            <SectionTitle>Guests</SectionTitle>
            <HeaderActions>
              {!showForm && (
                <Button onClick={handleAdd}>Add Guest</Button>
              )}
            </HeaderActions>
          </Header>

          {error && <ErrorText>{error}</ErrorText>}

          {showForm && (
            <FormCard>
              <FormTitle>{editingGuest ? 'Edit Guest' : 'Add New Guest'}</FormTitle>
              <Form onSubmit={handleSubmit}>
                <FormRow>
                  <FormField>
                    <Label>Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </FormField>
                  <FormField>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </FormField>
                </FormRow>
                <FormRow>
                  <FormField>
                    <Label>Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </FormField>
                </FormRow>
                <FormField>
                  <Label>Notes</Label>
                  <TextArea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </FormField>
                <FormActions>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save Guest'}
                  </Button>
                  <Button type="button" onClick={handleCancel} style={{ background: '#6b7280' }}>
                    Cancel
                  </Button>
                </FormActions>
              </Form>
            </FormCard>
          )}

          <GuestsGrid>
            {guests.length === 0 ? (
              <EmptyState>
                <EmptyText>No guests yet</EmptyText>
                <EmptySubtext>Add your first guest to get started</EmptySubtext>
                {!showForm && (
                  <Button onClick={handleAdd}>Add Guest</Button>
                )}
              </EmptyState>
            ) : (
              guests.map(guest => (
                <GuestCard key={guest.id}>
                  <GuestInfo>
                    <GuestName>{guest.name}</GuestName>
                    <GuestEmail>{guest.email}</GuestEmail>
                    {guest.phone && <GuestPhone>{guest.phone}</GuestPhone>}
                    {guest.notes && <GuestNotes>{guest.notes}</GuestNotes>}
                  </GuestInfo>
                  <CardActions>
                    <EditButton onClick={() => handleEdit(guest)}>Edit</EditButton>
                  </CardActions>
                </GuestCard>
              ))
            )}
          </GuestsGrid>
        </PageWrapper>
      </Container>
    </AuthGuard>
  )
}

const PageWrapper = styled.div`
  padding: 2rem 0;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 1rem;
  }
`

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
`

const FormCard = styled(BasicCard)`
  margin-bottom: 2rem;
`

const FormTitle = styled.h3`
  margin: 0 0 1.5rem;
  font-size: 1.8rem;
  font-weight: 600;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Label = styled.label`
  font-size: 1.3rem;
  font-weight: 500;
  opacity: 0.9;
`

const TextArea = styled.textarea`
  padding: 1rem;
  border: 1px solid rgb(var(--border));
  border-radius: 0.6rem;
  background: rgb(var(--inputBackground));
  color: rgb(var(--text));
  font-family: inherit;
  font-size: 1.4rem;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: rgb(var(--primary));
  }
`

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`

const GuestsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`

const GuestCard = styled(BasicCard)`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`

const GuestInfo = styled.div`
  flex: 1;
`

const GuestName = styled.div`
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`

const GuestEmail = styled.div`
  color: rgb(var(--primary));
  margin-bottom: 0.3rem;
`

const GuestPhone = styled.div`
  font-size: 1.3rem;
  opacity: 0.7;
  margin-bottom: 0.3rem;
`

const GuestNotes = styled.div`
  font-size: 1.3rem;
  opacity: 0.7;
  font-style: italic;
`

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-left: 1rem;
`

const EditButton = styled.button`
  padding: 0.5rem 1rem;
  background: rgb(var(--primary));
  color: white;
  border: none;
  border-radius: 0.4rem;
  cursor: pointer;
  font-size: 1.2rem;
  min-height: 44px;
  
  &:hover {
    opacity: 0.9;
  }
`

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
`

const EmptyText = styled.div`
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  opacity: 0.8;
`

const EmptySubtext = styled.div`
  font-size: 1.4rem;
  opacity: 0.6;
  margin-bottom: 2rem;
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
  padding: 1rem;
  background: #fef2f2;
  border-radius: 0.6rem;
`
