import NextImage from 'next/image';
import styled from 'styled-components';

interface BasicCardProps {
  title: string;
  description: string;
  imageUrl: string;
  status?: 'Implemented' | 'Coming Soon';
}

export default function BasicCard({ title, description, imageUrl, status }: BasicCardProps) {
  return (
    <Card>
      <NextImage src={imageUrl} width={128} height={128} alt={title} />
      {status && <Badge data-status={status}>{status}</Badge>}
      <Title>{title}</Title>
      <Description>{description}</Description>
    </Card>
  );
}

const Card = styled.div`
  display: flex;
  padding: 2.5rem;
  background: rgb(var(--cardBackground));
  box-shadow: var(--shadow-md);
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  width: 100%;
  border-radius: 0.6rem;
  color: rgb(var(--text));
  font-size: 1.6rem;

  & > *:not(:first-child) {
    margin-top: 1rem;
  }
`;

const Title = styled.div`
  font-weight: bold;
`;

const Description = styled.div`
  opacity: 0.6;
`;

const Badge = styled.span`
  margin-top: 0.5rem;
  font-size: 1.1rem;
  padding: 0.2rem 0.6rem;
  border-radius: 0.4rem;
  background: rgba(0, 0, 0, 0.06);
  color: rgb(var(--text));

  &[data-status='Implemented'] {
    /* Solid emerald with white text for strong contrast */
    background: #10b981; /* emerald-500 */
    color: #ffffff;
  }
  &[data-status='Coming Soon'] {
    background: rgba(59, 130, 246, 0.15); /* blue-500 tint */
    color: #1e3a8a;
  }
  /* Future red statuses render with white text for readability */
  &[data-status='Blocked'],
  &[data-status='Not Implemented'],
  &[data-status='Deprecated'] {
    background: #ef4444; /* red-500 */
    color: #ffffff;
  }
`;
