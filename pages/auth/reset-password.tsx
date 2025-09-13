import React, { useState } from 'react';
import styled from 'styled-components';
import Container from 'components/Container';
import Input from 'components/Input';
import Button from 'components/Button';
import SectionTitle from 'components/SectionTitle';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMessage('If this email exists, we sent reset instructions.');
    }, 600);
  }

  return (
    <Container>
      <Wrapper>
        <Card>
          <SectionTitle>Reset your password</SectionTitle>
          <Subtitle>We will email you a link to create a new password.</Subtitle>
          <Form onSubmit={onSubmit}>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            {message && <InfoText>{message}</InfoText>}
            <Actions>
              <Button type="submit" disabled={loading}>
                {loading ? 'Sending…' : 'Send reset link'}
              </Button>
              <SmallLink href="/auth/login">Back to login</SmallLink>
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

const InfoText = styled.div`
  margin-top: 0.4rem;
  color: #065f46; /* emerald-800 */
  font-size: 1.3rem;
`;

