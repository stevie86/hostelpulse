import styled from 'styled-components';
import Container from './Container';

const ComingSoonHero = () => {
  return (
    <HeroWrapper>
      <Container>
        <HeroContent>
          <PrimaryHeadline>
            Manage all your bookings across all platforms. Never lose a booking again.
          </PrimaryHeadline>
          <SubHeadline>
            Hostelpulse is coming soon. The all-in-one platform for modern hostel management.
          </SubHeadline>
        </HeroContent>
      </Container>
    </HeroWrapper>
  );
};

const HeroWrapper = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #0066CC 0%, #FF6B35 100%);
  color: white;
`;

const HeroContent = styled.div`
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
`;

const PrimaryHeadline = styled.h1`
  font-family: 'Inter', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const SubHeadline = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 1.25rem;
  font-weight: 400;
  line-height: 1.5;
  opacity: 0.9;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

export default ComingSoonHero;