import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Button from 'components/Button';
import Container from 'components/Container';
import Input from 'components/Input';
import SectionTitle from 'components/SectionTitle';
import { supabase } from '../lib/supabase';



export default function ProfilePage() {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        router.push('/auth/login');
        return;
      }
      
      setUser(user);
      setProfile({
        name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || user.id || '',
        email: user.email || '',
      });
      setLoading(false);
    };

    fetchUser();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          name: profile.name
        }
      });

      if (error) throw error;

      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    try {
      // This will send a password reset email to the user
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email);
      
      if (error) throw error;
      
      setSuccess('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email');
      console.error('Error sending password reset:', err);
    }
  };

  if (loading) {
    return (
      <Container>
        <Wrapper>
          <SectionTitle>Profile</SectionTitle>
          <Loading>Loading profile...</Loading>
        </Wrapper>
      </Container>
    );
  }

  return (
    <Container>
      <Wrapper>
        <Header>
          <SectionTitle>Profile</SectionTitle>
          <Small>Manage your account settings</Small>
        </Header>

        <Card>
          <CardTitle>Account Information</CardTitle>
          
          {error && <ErrorText>{error}</ErrorText>}
          {success && <SuccessText>{success}</SuccessText>}
          
          <Form onSubmit={handleSubmit}>
            <InputRow>
              <Input
                type="text"
                name="name"
                placeholder="Name"
                value={profile.name}
                onChange={handleChange}
                required
              />
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={profile.email}
                onChange={handleChange}
                disabled
              />
            </InputRow>
            
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Update Profile'}
            </Button>
          </Form>
          
          <Divider />
          
          <PasswordSection>
            <h4>Change Password</h4>
            <Button type="button" onClick={handlePasswordChange}>
              Send Password Reset Email
            </Button>
          </PasswordSection>
        </Card>
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

const Card = styled.div`
  background: rgb(var(--cardBackground));
  border: 1px solid rgb(var(--border));
  border-radius: 0.8rem;
  padding: 1.5rem;
`;

const CardTitle = styled.h3`
  margin: 0 0 1rem;
`;

const Form = styled.form`
  display: grid;
  gap: 1rem;
`;

const InputRow = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
`;

const Loading = styled.div`
  text-align: center;
  padding: 2rem;
`;

const ErrorText = styled.div`
  color: #b91c1c;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: rgba(210, 38, 38, 0.1);
  border-radius: 0.5rem;
`;

const SuccessText = styled.div`
  color: #047857;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 0.5rem;
`;

const Divider = styled.div`
  height: 1px;
  background: rgb(var(--border));
  margin: 1.5rem 0;
`;

const PasswordSection = styled.div`
  margin-top: 1rem;
  
  h4 {
    margin: 0 0 0.8rem;
  }
  
  button {
    background: rgba(59, 130, 246, 0.1);
    color: #1d4ed8;
    
    &:hover {
      background: rgba(59, 130, 246, 0.2);
    }
  }
`;