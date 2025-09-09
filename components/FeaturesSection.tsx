import styled from 'styled-components';
import Container from './Container';
import FeatureCard from './FeatureCard';
const FeaturesSection = () => {
  const features = [
    {
      icon: '💰',
      title: 'Automated Tax Collection',
      description: 'Automatically collect Lisbon City Tax from all bookings',
    },
    {
      icon: '📄',
      title: 'Invoice Generation',
      description: 'Generate official Portuguese facturas instantly',
    },
    {
      icon: '🔄',
      title: 'Multi-Platform Sync',
      description: 'Centralized inventory management across all booking platforms',
    },
  ];

  return (
    <Section>
      <Container>
        <SectionTitle>Coming Soon Features</SectionTitle>
        <Grid>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </Grid>
      </Container>
    </Section>
  );
};

const Section = styled.section`
  padding: 5rem 0;
  background: #f8f9fa;
`;

const SectionTitle = styled.h2`
  font-family: 'Inter', sans-serif;
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 3rem;
  color: #1a1a1a;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

export default FeaturesSection;