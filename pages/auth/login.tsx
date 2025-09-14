import React, { useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import Container from 'components/Container';
import Input from 'components/Input';
import Button from 'components/Button';
import SectionTitle from 'components/SectionTitle';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const showDemo = process.env.NEXT_PUBLIC_SHOW_DEMO_CREDS === '1';
  const demoEmail = process.env.NEXT_PUBLIC_DEMO_EMAIL || '';
  const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD || '';
  const demoNote = process.env.NEXT_PUBLIC_DEMO_NOTE || '';

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <Wrapper>
        <Card>
          <SectionTitle>Welcome back</SectionTitle>
          <Subtitle>Log in to manage your hostel quickly and safely.</Subtitle>
          {showDemo && (
            <DemoBanner>
              <strong>Demo account</strong>
              <div>{demoEmail || 'Request demo email'}</div>
              {demoPassword && <div>Password: {demoPassword}</div>}
              {demoNote && <small>{demoNote}</small>}
              {demoEmail && (
                <DemoRow>
                  <Button as="button" type="button" onClick={() => { setEmail(demoEmail); if (demoPassword) setPassword(demoPassword); }}>
                    Autofill demo
                  </Button>
                </DemoRow>
              )}
            </DemoBanner>
          )}
          <Form onSubmit={onSubmit}>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <ErrorText>{error}</ErrorText>}
            <Actions>
              <Button as="button" type="submit" disabled={loading}>
                {loading ? 'Logging in…' : 'Log in'}
              </Button>
              <SmallLink href="/auth/reset-password">Forgot password?</SmallLink>
            </Actions>
          </Form>
          <Small>
            No account yet? <SmallLink href="/auth/register">Create one</SmallLink>
          </Small>
        </Card>
      </Wrapper>
    </Container>
  );
}

const Wrapper = styled.div`
  display: grid;
  place-items: center;
  min-height: calc(100vh - 12rem);
`;

const Card = styled.div`
  width: 100%;
  max-width: 42rem;
  background: rgb(var(--cardBackground));
  color: rgb(var(--text));
  padding: 2.4rem;
  border-radius: 0.8rem;
  box-shadow: var(--shadow-md);
`;

const Subtitle = styled.p`
  margin: 0.6rem 0 1.6rem;
  opacity: 0.8;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: 0.8rem;
`;

const Label = styled.label`
  font-size: 1.3rem;
  opacity: 0.9;
`;

const Actions = styled.div`
  margin-top: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Small = styled.div`
  margin-top: 1.2rem;
  font-size: 1.3rem;
  opacity: 0.8;
`;

const SmallLink = styled.a`
  color: rgb(var(--primary));
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

const ErrorText = styled.div`
  margin-top: 0.4rem;
  color: #b91c1c; /* red-700 */
  font-size: 1.3rem;
`;

const DemoBanner = styled.div`
  border: 1px dashed rgb(var(--border));
  background: rgba(0,0,0,0.03);
  border-radius: 0.6rem;
  padding: 1rem;
  margin-bottom: 1rem;
  small { opacity: .8; }
`;

const DemoRow = styled.div`
  margin-top: .6rem;
`;
