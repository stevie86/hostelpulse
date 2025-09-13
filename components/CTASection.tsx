import styled from 'styled-components';
import Container from './Container';
import { useState } from 'react';

const CTASection = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      console.log('Email submitted:', email);
      setIsSubmitted(true);
      setEmail('');
      setTimeout(() => setIsSubmitted(false), 3000);
    }
  };

  return (
    <Section>
      <Container>
        <CTAContent>
          <Title>Stay Updated</Title>
          <Description>
            Be the first to know when Hostelpulse launches. Get early access and exclusive updates.
          </Description>
          <Form onSubmit={handleSubmit}>
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit">Keep me updated</Button>
          </Form>
          {isSubmitted && <SuccessMessage>Thank you! We&apos;ll keep you updated.</SuccessMessage>}
        </CTAContent>
      </Container>
    </Section>
  );
};

const Section = styled.section`
  padding: 5rem 0;
  background: linear-gradient(135deg, #0066CC 0%, #FF6B35 100%);
  color: white;
`;

const CTAContent = styled.div`
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-family: 'Inter', sans-serif;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const Description = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 1.125rem;
  margin-bottom: 2rem;
  opacity: 0.9;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const Form = styled.form`
  display: flex;
  gap: 1rem;
  max-width: 500px;
  margin: 0 auto;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const Input = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;

  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }

  &:focus {
    outline: none;
    border-color: white;
    background: rgba(255, 255, 255, 0.2);
  }

  @media (max-width: 768px) {
    padding: 0.875rem 1rem;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background: white;
  color: #0066CC;
  border: none;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.9);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 0.875rem 1.5rem;
  }
`;

const SuccessMessage = styled.p`
  margin-top: 1rem;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  color: #90EE90;
  font-weight: 500;
`;

export default CTASection;