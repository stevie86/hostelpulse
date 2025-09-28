import { format, parseISO, addDays } from 'date-fns';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Button from 'components/Button';
import Container from 'components/Container';
import Input from 'components/Input';
import SectionTitle from 'components/SectionTitle';
import { supabase } from '../../lib/supabase';

type Guest = { id: string; name: string; email: string };
type Room = { id: string; name: string; type: string };
type Bed = { id: string; name: string; room_id: string };

export default function CreateBookingPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    guest_id: '',
    room_id: '',
    bed_id: '',
    check_in: format(new Date(), 'yyyy-MM-dd'),
    check_out: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    status: 'confirmed' as 'confirmed' | 'pending' | 'cancelled',
    notes: ''
  });
  
  const [availableBeds, setAvailableBeds] = useState<Bed[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch available rooms based on dates
  useEffect(() => {
    if (form.check_in && form.check_out) {
      fetchAvailableRoomsAndBeds();
    }
  }, [form.check_in, form.check_out]);

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
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRoomsAndBeds = async () => {
    try {
      // In a real app, we would check for availability based on existing bookings
      // For now, we'll just use all rooms/beds
      setAvailableRooms(rooms);
      setAvailableBeds(beds);
    } catch (err) {
      console.error('Error fetching available rooms/beds:', err);
      setError('Failed to load available rooms/beds');
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
      } else if (form.room_id) {
        payload.room_id = form.room_id;
      }

      const { error } = await supabase.from('bookings').insert([payload]);

      if (error) throw error;

      setSuccess(true);
      // Reset form or redirect after a delay
      setTimeout(() => {
        router.push('/bookings');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create booking');
      console.error('Error creating booking:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Wrapper>
          <SectionTitle>Create Booking</SectionTitle>
          <Loading>Loading...</Loading>
        </Wrapper>
      </Container>
    );
  }

  return (
    <Container>
      <Wrapper>
        <Header>
          <SectionTitle>Create Booking</SectionTitle>
          <Small>Add a new booking for your hostel</Small>
        </Header>

        {success ? (
          <SuccessMessage>Booking created successfully! Redirecting...</SuccessMessage>
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

              <div>
                <Label htmlFor="room_id">Room (optional)</Label>
                <Select
                  id="room_id"
                  name="room_id"
                  value={form.room_id}
                  onChange={handleChange}
                  disabled={!!form.bed_id} // Disable if bed is selected
                >
                  <option value="">Select a room (or choose a bed)</option>
                  {availableRooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.name} ({room.type})
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="bed_id">Bed (optional)</Label>
                <Select
                  id="bed_id"
                  name="bed_id"
                  value={form.bed_id}
                  onChange={handleChange}
                  disabled={!!form.room_id} // Disable if room is selected
                >
                  <option value="">Select a bed (or choose a room)</option>
                  {availableBeds.map(bed => (
                    <option key={bed.id} value={bed.id}>
                      {bed.name}
                    </option>
                  ))}
                </Select>
                <Hint>Select either a room or a bed, not both</Hint>
              </div>

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

            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating Booking...' : 'Create Booking'}
            </Button>
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

const Hint = styled.small`
  display: block;
  margin-top: 0.3rem;
  opacity: 0.7;
  font-size: 0.9rem;
`;