import { format, addDays } from 'date-fns';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Button from 'components/Button';
import Container from 'components/Container';
import Input from 'components/Input';
import SectionTitle from 'components/SectionTitle';
import { supabase } from '../../../lib/supabase';

type Guest = { id: string; name: string; email: string };
type Room = { id: string; name: string; type: string };
type Bed = { id: string; name: string; room_id: string };
type Booking = {
  id: string;
  guest_id: string;
  room_id?: string;
  bed_id?: string;
  check_in: string;
  check_out: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  notes?: string;
};

export default function EditBookingPage() {
  const router = useRouter();
  const { id } = router.query;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  
  const [form, setForm] = useState({
    guest_id: '',
    room_id: '',
    bed_id: '',
    check_in: '',
    check_out: '',
    status: 'confirmed' as 'confirmed' | 'pending' | 'cancelled',
    notes: ''
  });

  useEffect(() => {
    if (id) {
      fetchBooking();
      fetchData();
    }
  }, [id]);

  const fetchBooking = async () => {
    if (!id || typeof id !== 'string') return;
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          guests!inner(name, email),
          rooms(name),
          beds(name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      setBooking(data);
      setForm({
        guest_id: data.guest_id || '',
        room_id: data.room_id || '',
        bed_id: data.bed_id || '',
        check_in: data.check_in.split('T')[0] || format(new Date(), 'yyyy-MM-dd'),
        check_out: data.check_out.split('T')[0] || format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        status: data.status || 'confirmed',
        notes: data.notes || ''
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load booking');
      console.error('Error loading booking:', err);
    }
  };

  const fetchData = async () => {
    try {
      const [guestsRes, roomsRes, bedsRes] = await Promise.all([
        supabase.from('guests').select('*').order('name', { ascending: true }),
        supabase.from('rooms').select('*').order('name', { ascending: true }),
        supabase.from('beds').select('*').order('name', { ascending: true })
      ]);

      if (guestsRes.error) throw guestsRes.error;
      if (roomsRes.error) throw roomsRes.error;
      if (bedsRes.error) throw bedsRes.error;

      setGuests(guestsRes.data);
      setRooms(roomsRes.data);
      setBeds(bedsRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      // Prepare the payload
      const payload: any = {
        guest_id: form.guest_id,
        check_in: form.check_in,
        check_out: form.check_out,
        status: form.status,
        notes: form.notes,
      };

      // Only include room_id or bed_id, not both
      if (form.bed_id) {
        payload.bed_id = form.bed_id;
        payload.room_id = null; // Clear room_id if bed is selected
      } else if (form.room_id) {
        payload.room_id = form.room_id;
        payload.bed_id = null; // Clear bed_id if room is selected
      } else {
        payload.room_id = null;
        payload.bed_id = null;
      }

      const { error } = await supabase
        .from('bookings')
        .update(payload)
        .eq('id', id);

      if (error) throw error;

      setSuccess(true);
      // Redirect after a delay
      setTimeout(() => {
        router.push('/bookings');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update booking');
      console.error('Error updating booking:', err);
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
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Redirect to bookings list after deletion
      router.push('/bookings');
    } catch (err: any) {
      setError(err.message || 'Failed to delete booking');
      console.error('Error deleting booking:', err);
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Wrapper>
          <SectionTitle>Edit Booking</SectionTitle>
          <Loading>Loading booking...</Loading>
        </Wrapper>
      </Container>
    );
  }

  if (!booking) {
    return (
      <Container>
        <Wrapper>
          <SectionTitle>Edit Booking</SectionTitle>
          <ErrorText>Booking not found</ErrorText>
        </Wrapper>
      </Container>
    );
  }

  return (
    <Container>
      <Wrapper>
        <Header>
          <SectionTitle>Edit Booking</SectionTitle>
          <Small>Update booking details</Small>
        </Header>

        {success ? (
          <SuccessMessage>Booking updated successfully! Redirecting...</SuccessMessage>
        ) : (
          <Form onSubmit={handleSubmit}>
            {error && <ErrorText>{error}</ErrorText>}

            <Grid>
              <div>
                <Label htmlFor="guest_id">Guest *</Label>
                <Select
                  id="guest_id"
                  name="guest_id"
                  value={form.guest_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a guest</option>
                  {guests.map(guest => (
                    <option key={guest.id} value={guest.id}>
                      {guest.name} ({guest.email})
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="check_in">Check-in *</Label>
                <Input
                  type="date"
                  id="check_in"
                  name="check_in"
                  value={form.check_in}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="check_out">Check-out *</Label>
                <Input
                  type="date"
                  id="check_out"
                  name="check_out"
                  value={form.check_out}
                  onChange={handleChange}
                  required
                />
              </div>
            </Grid>

            <Grid>
              <div>
                <Label htmlFor="room_id">Room</Label>
                <Select
                  id="room_id"
                  name="room_id"
                  value={form.room_id}
                  onChange={handleChange}
                  disabled={!!form.bed_id} // Disable if bed is selected
                >
                  <option value="">No specific room</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.name} ({room.type})
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="bed_id">Bed</Label>
                <Select
                  id="bed_id"
                  name="bed_id"
                  value={form.bed_id}
                  onChange={handleChange}
                  disabled={!!form.room_id} // Disable if room is selected
                >
                  <option value="">No specific bed</option>
                  {beds.map(bed => (
                    <option key={bed.id} value={bed.id}>
                      {bed.name} (Room: {rooms.find(r => r.id === bed.room_id)?.name || 'Unknown'})
                    </option>
                  ))}
                </Select>
              </div>
            </Grid>

            <Grid>
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  required
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </div>
            </Grid>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <TextArea
                id="notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Additional notes about this booking..."
                rows={3}
              />
            </div>

            <Actions>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Update Booking'}
              </Button>
              <Button 
                type="button" 
                onClick={() => router.push('/bookings')}
              >
                Cancel
              </Button>
              
              <DeleteSection>
                <Button 
                  type="button" 
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : deleteConfirm ? 'Confirm Delete' : 'Delete Booking'}
                </Button>
                {deleteConfirm && !deleting && (
                  <DeleteWarning>
                    This action cannot be undone.
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