import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Button from 'components/Button';
import Container from 'components/Container';
import Input from 'components/Input';
import SectionTitle from 'components/SectionTitle';
import { supabase } from '../../../lib/supabase';

type Room = {
  id: string;
  name: string;
  type: 'private' | 'dorm';
  max_capacity: number;
};

export default function EditRoomPage() {
  const router = useRouter();
  const { id } = router.query;
  const [room, setRoom] = useState<Room | null>(null);
  const [form, setForm] = useState({
    name: '',
    type: 'private' as 'private' | 'dorm',
    max_capacity: 1,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchRoom();
    }
  }, [id]);

  const fetchRoom = async () => {
    if (!id || typeof id !== 'string') return;
    
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setRoom(data);
      setForm({
        name: data.name || '',
        type: data.type || 'private',
        max_capacity: data.max_capacity || 1,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load room');
      console.error('Error loading room:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'max_capacity' ? parseInt(value) || 1 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || typeof id !== 'string') return;
    
    setSubmitting(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('rooms')
        .update({
          name: form.name,
          type: form.type,
          max_capacity: form.max_capacity,
        })
        .eq('id', id);

      if (error) throw error;

      setSuccess(true);
      // Redirect after a delay
      setTimeout(() => {
        router.push('/rooms');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update room');
      console.error('Error updating room:', err);
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
        .from('rooms')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Redirect to rooms list after deletion
      router.push('/rooms');
    } catch (err: any) {
      setError(err.message || 'Failed to delete room');
      console.error('Error deleting room:', err);
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Wrapper>
          <SectionTitle>Edit Room</SectionTitle>
          <Loading>Loading room...</Loading>
        </Wrapper>
      </Container>
    );
  }

  if (!room) {
    return (
      <Container>
        <Wrapper>
          <SectionTitle>Edit Room</SectionTitle>
          <ErrorText>Room not found</ErrorText>
        </Wrapper>
      </Container>
    );
  }

  return (
    <Container>
      <Wrapper>
        <Header>
          <SectionTitle>Edit Room</SectionTitle>
          <Small>Update room information</Small>
        </Header>

        {success ? (
          <SuccessMessage>Room updated successfully! Redirecting...</SuccessMessage>
        ) : (
          <Form onSubmit={handleSubmit}>
            {error && <ErrorText>{error}</ErrorText>}

            <div>
              <Label htmlFor="name">Room Name *</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g., Standard Room 101, Dorm A"
                required
              />
            </div>

            <Grid>
              <div>
                <Label htmlFor="type">Room Type *</Label>
                <Select
                  id="type"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  required
                >
                  <option value="private">Private Room</option>
                  <option value="dorm">Dormitory</option>
                </Select>
              </div>

              <div>
                <Label htmlFor="max_capacity">
                  {form.type === 'dorm' ? 'Max Capacity (Beds)' : 'Max Guests'}
                </Label>
                <Input
                  type="number"
                  id="max_capacity"
                  name="max_capacity"
                  min="1"
                  value={form.max_capacity}
                  onChange={handleChange}
                  required
                />
              </div>
            </Grid>

            <Actions>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Update Room'}
              </Button>
              <Button 
                type="button" 
                onClick={() => router.push('/rooms')}
              >
                Cancel
              </Button>
              
              <DeleteSection>
                <Button 
                  type="button" 
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : deleteConfirm ? 'Confirm Delete' : 'Delete Room'}
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

const Select = styled.select`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid rgb(var(--border));
  border-radius: 0.6rem;
  background: rgb(var(--cardBackground));
  color: rgb(var(--text));
  font-size: 1rem;
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