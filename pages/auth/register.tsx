import React, { useState } from 'react';
import styled from 'styled-components';
import Container from 'components/Container';
import Input from 'components/Input';
import Button from 'components/Button';
import SectionTitle from 'components/SectionTitle';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setError('Demo only — account creation will be enabled soon.');
    }, 600);
  }

  return (
    <Container>
      <Wrapper>
        <Card>
          <SectionTitle>Create your account</SectionTitle>
          <Subtitle>Start managing arrivals, bookings, and guests in minutes.</Subtitle>
          <Form onSubmit={onSubmit}>
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Alex Hostel" value={name} onChange={(e) => setName(e.target.value)} required />
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <ErrorText>{error}</ErrorText>}
            <Actions>
              <Button as="button" type="submit" disabled={loading}>
                {loading ? 'Creating…' : 'Create account'}
              </Button>
              <SmallLink href="/auth/login">Have an account? Log in</SmallLink>
            </Actions>
          </Form>
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

const SmallLink = styled.a`
  color: rgb(var(--primary));
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

const ErrorText = styled.div`
  margin-top: 0.4rem;
  color: #b91c1c;
  font-size: 1.3rem;
`;
