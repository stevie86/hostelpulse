import { useRouter } from 'next/router';
import React, { useState } from 'react';
import styled from 'styled-components';
import Button from 'components/Button';
import Container from 'components/Container';
import Input from 'components/Input';
import SectionTitle from 'components/SectionTitle';
import { supabase } from '../../../lib/supabase';

type Guest = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
};

export default function EditGuestPage() {
  const router = useRouter();
  const { id } = router.query;
  const [guest, setGuest] = useState<Guest | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  React.useEffect(() => {
    if (id && typeof id === 'string') {
      fetchGuest();
    }
  }, [id]);

  const fetchGuest = async () => {
    if (!id || typeof id !== 'string') return;
    
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setGuest(data);
      setForm({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        notes: data.notes || ''
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load guest');
      console.error('Error loading guest:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || typeof id !== 'string') return;
    
    setSubmitting(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('guests')
        .update({
          name: form.name,
          email: form.email,
          phone: form.phone,
          notes: form.notes
        })
        .eq('id', id);

      if (error) throw error;

      setSuccess(true);
      // Redirect after a delay
      setTimeout(() => {
        router.push('/guests');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update guest');
      console.error('Error updating guest:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id || typeof id !== 'string') return;
    
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Redirect to guests list after deletion
      router.push('/guests');
    } catch (err: any) {
      setError(err.message || 'Failed to delete guest');
      console.error('Error deleting guest:', err);
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Wrapper>
          <SectionTitle>Edit Guest</SectionTitle>
          <Loading>Loading guest...</Loading>
        </Wrapper>
      </Container>
    );
  }

  if (!guest) {
    return (
      <Container>
        <Wrapper>
          <SectionTitle>Edit Guest</SectionTitle>
          <ErrorText>Guest not found</ErrorText>
        </Wrapper>
      </Container>
    );
  }

  return (
    <Container>
      <Wrapper>
        <Header>
          <SectionTitle>Edit Guest</SectionTitle>
          <Small>Update guest information</Small>
        </Header>

        {success ? (
          <SuccessMessage>Guest updated successfully! Redirecting...</SuccessMessage>
        ) : (
          <Form onSubmit={handleSubmit}>
            {error && <ErrorText>{error}</ErrorText>}

            <Grid>
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </Grid>

            <Grid>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </Grid>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <TextArea
                id="notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Additional notes about this guest..."
                rows={3}
              />
            </div>

            <Actions>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Update Guest'}
              </Button>
              <Button 
                type="button" 
                onClick={() => router.push('/guests')}
              >
                Cancel
              </Button>
              
              <DeleteSection>
                <Button 
                  type="button" 
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : deleteConfirm ? 'Confirm Delete' : 'Delete Guest'}
                </Button>
                {deleteConfirm && !deleting && (
                  <DeleteWarning>
                    This action cannot be undone. All related bookings will also be deleted.
                  </DeleteWarning>
                )}
              </DeleteSection>
            </Actions>
          </Form>
        )}
      </Wrapper>
    </Container>
  );
}

const Wrapper = styled.div`
  padding: 2rem 0;
`;

const Header = styled.div`
  margin-bottom: 1.5rem;
`;

const Small = styled.p`
  opacity: 0.7;
`;

const Form = styled.form`
  display: grid;
  gap: 1.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid rgb(var(--border));
  border-radius: 0.6rem;
  background: rgb(var(--cardBackground));
  color: rgb(var(--text));
  font-size: 1rem;
  resize: vertical;
`;

const Loading = styled.div`
  text-align: center;
  padding: 2rem;
`;

const ErrorText = styled.div`
  color: #b91c1c;
  margin-bottom: 1rem;
  padding: 0.8rem;
  background: rgba(210, 38, 38, 0.1);
  border-radius: 0.5rem;
`;

const SuccessMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #047857;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 0.5rem;
  margin-bottom: 1rem;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
  align-items: flex-start;
`;

const DeleteSection = styled.div`
  margin-left: auto;
`;

const DeleteWarning = styled.div`
  margin-top: 0.5rem;
  font-size: 1.2rem;
  color: #b91c1c;
  background: rgba(210, 38, 38, 0.1);
  padding: 0.5rem;
  border-radius: 0.4rem;
`;