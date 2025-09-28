import { useRouter } from 'next/router';
import React, { useState } from 'react';
import styled from 'styled-components';
import Button from 'components/Button';
import Container from 'components/Container';
import Input from 'components/Input';
import SectionTitle from 'components/SectionTitle';
import { supabase } from '../../lib/supabase';

export default function CreateRoomPage() {
  const [form, setForm] = useState({
    name: '',
    type: 'private' as 'private' | 'dorm',
    max_capacity: 1,
    beds: [] as string[],
  });
  const [newBedName, setNewBedName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'max_capacity' ? parseInt(value) : value
    }));
  };

  const addBed = () => {
    if (newBedName.trim()) {
      setForm(prev => ({
        ...prev,
        beds: [...prev.beds, newBedName.trim()],
      }));
      setNewBedName('');
    }
  };

  const removeBed = (index: number) => {
    setForm(prev => {
      const newBeds = [...prev.beds];
      newBeds.splice(index, 1);
      return { ...prev, beds: newBeds };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: form.name,
        type: form.type,
        max_capacity: form.type === 'dorm' ? form.beds.length || form.max_capacity : form.max_capacity,
        beds: form.type === 'dorm' ? form.beds : undefined,
      };

      const { error } = await supabase.from('rooms').insert([payload]);

      if (error) throw error;

      setSuccess(true);
      // Redirect after a delay
      setTimeout(() => {
        router.push('/rooms');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create room');
      console.error('Error creating room:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Wrapper>
        <Header>
          <SectionTitle>Create Room</SectionTitle>
          <Small>Add a new room to your hostel</Small>
        </Header>

        {success ? (
          <SuccessMessage>Room created successfully! Redirecting...</SuccessMessage>
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

            {form.type === 'dorm' && (
              <div>
                <Label>Bed Names</Label>
                <BedsSection>
                  <div>
                    <Input
                      type="text"
                      value={newBedName}
                      onChange={(e) => setNewBedName(e.target.value)}
                      placeholder="Add a bed name (e.g., Bed 1)"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBed())}
                    />
                    <Button type="button" onClick={addBed}>
                      Add Bed
                    </Button>
                  </div>
                  
                  {form.beds.length > 0 && (
                    <BedsList>
                      {form.beds.map((bed, index) => (
                        <BedItem key={index}>
                          <span>{bed}</span>
                          <Button 
                            type="button" 
                            onClick={() => removeBed(index)}
                          >
                            Remove
                          </Button>
                        </BedItem>
                      ))}
                    </BedsList>
                  )}
                  
                  <Hint>Total beds: {form.beds.length} (Max capacity will be automatically adjusted)</Hint>
                </BedsSection>
              </div>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? 'Creating Room...' : 'Create Room'}
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

const BedsSection = styled.div`
  background: rgba(0, 0, 0, 0.03);
  padding: 1.2rem;
  border-radius: 0.6rem;
  
  > div {
    display: flex;
    gap: 0.8rem;
    margin-bottom: 1rem;
    
    input {
      flex: 1;
    }
  }
`;

const BedsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const BedItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem;
  background: rgb(var(--cardBackground));
  border: 1px solid rgb(var(--border));
  border-radius: 0.4rem;
  
  span {
    flex: 1;
  }
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