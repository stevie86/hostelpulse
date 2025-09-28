import React from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import Container from 'components/Container';
import SectionTitle from 'components/SectionTitle';
import OverTitle from 'components/OverTitle';
import RichText from 'components/RichText';
import { media } from 'utils/media';

export default function FeaturesPage() {
  return (
    <>
      <Head>
        <title>HostelPulse — Powerful Features for Modern Hostels</title>
        <meta
          name="description"
          content="Discover how HostelPulse streamlines daily hostel operations with powerful features designed for modern hostel management."
        />
      </Head>
      <Wrapper>
        <Container>
          <Content>
            <OverTitle>hostel management redefined</OverTitle>
            <SectionTitle>Powerful Features for Modern Hostels</SectionTitle>
            <RichText>
              <p>
                HostelPulse is built specifically for hostel owners who want to spend less time on administrative tasks 
                and more time creating memorable experiences for their guests. Our platform combines intuitive workflows 
                with powerful automation features to transform your daily operations.
              </p>
            </RichText>
            
            <FeatureGrid>
              <FeatureCard>
                <FeatureIcon>📋</FeatureIcon>
                <FeatureTitle>Real-Time Arrivals & Departures</FeatureTitle>
                <FeatureDescription>
                  Instantly see today's check-ins and check-outs with one-click status updates. 
                  Keep your entire team synchronized across all channels without digging through spreadsheets.
                </FeatureDescription>
              </FeatureCard>
              
              <FeatureCard>
                <FeatureIcon>👥</FeatureIcon>
                <FeatureTitle>Smart Guest Management</FeatureTitle>
                <FeatureDescription>
                  Effortlessly add guests, create or cancel bookings, and automatically prevent double-bookings 
                  with intelligent conflict detection for both private rooms and dormitory beds.
                </FeatureDescription>
              </FeatureCard>
              
              <FeatureCard>
                <FeatureIcon>💾</FeatureIcon>
                <FeatureTitle>Seamless Data Migration</FeatureTitle>
                <FeatureDescription>
                  Transition from spreadsheets in minutes with our smart CSV importer that deduplicates guest records 
                  and previews changes before importing, ensuring data integrity throughout the process.
                </FeatureDescription>
              </FeatureCard>
              
              <FeatureCard>
                <FeatureIcon>📊</FeatureIcon>
                <FeatureTitle>Comprehensive Reporting</FeatureTitle>
                <FeatureDescription>
                  Generate and export detailed reports whenever you need them, whether for tax purposes, 
                  investor updates, or operational reviews, with flexible date range selections.
                </FeatureDescription>
              </FeatureCard>
              
              <FeatureCard>
                <FeatureIcon>🔒</FeatureIcon>
                <FeatureTitle>EU-Hosted Security</FeatureTitle>
                <FeatureDescription>
                  Built on Supabase infrastructure hosted in the EU with strict server-side controls, 
                  ensuring your guest data remains secure and compliant with regional regulations.
                </FeatureDescription>
              </FeatureCard>
              
              <FeatureCard>
                <FeatureIcon>🔌</FeatureIcon>
                <FeatureTitle>Developer API Access</FeatureTitle>
                <FeatureDescription>
                  RESTful endpoints to integrate with your existing tooling and workflows, 
                  allowing you to extend HostelPulse functionality to meet your unique needs.
                </FeatureDescription>
              </FeatureCard>
            </FeatureGrid>
            
            <ComingSoonSection>
              <SectionTitle>Coming Soon</SectionTitle>
              <FeatureGrid>
                <FeatureCard>
                  <FeatureIcon>📱</FeatureIcon>
                  <FeatureTitle>Keypad Email Integration</FeatureTitle>
                  <FeatureDescription>
                    Automatically send guests door codes and stay instructions with one click, 
                    reducing front desk burden and improving guest experience.
                  </FeatureDescription>
                </FeatureCard>
                
                <FeatureCard>
                  <FeatureIcon>💬</FeatureIcon>
                  <FeatureTitle>Telegram Bot Operations</FeatureTitle>
                  <FeatureDescription>
                    Manage daily operations from chat with simple commands like /today, /checkin, and /sendcode, 
                    allowing you to stay connected even when away from your desk.
                  </FeatureDescription>
                </FeatureCard>
                
                <FeatureCard>
                  <FeatureIcon>🏨</FeatureIcon>
                  <FeatureTitle>Multi-Property Support</FeatureTitle>
                  <FeatureDescription>
                    Owner-scoped access with Row Level Security for managing multiple properties from a single dashboard, 
                    perfect for growing hostel chains.
                  </FeatureDescription>
                </FeatureCard>
              </FeatureGrid>
            </ComingSoonSection>
          </Content>
        </Container>
      </Wrapper>
    </>
  );
}

const Wrapper = styled.div`
  padding: 10rem 0;
  
  ${media('<=tablet')} {
    padding: 5rem 0;
  }
`;

const Content = styled.div`
  & > *:not(:first-child) {
    margin-top: 2rem;
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 3rem;
  margin-top: 5rem;
  
  ${media('<=tablet')} {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const FeatureCard = styled.div`
  background: rgb(var(--cardBackground));
  border-radius: 0.8rem;
  padding: 3rem;
  box-shadow: var(--shadow-md);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
  }
  
  ${media('<=tablet')} {
    padding: 2rem;
  }
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1.5rem;
`;

const FeatureTitle = styled.h3`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: rgb(var(--text));
`;

const FeatureDescription = styled.p`
  font-size: 1.6rem;
  color: rgba(var(--text), 0.8);
  line-height: 1.6;
`;

const ComingSoonSection = styled.div`
  margin-top: 8rem;
  
  & > *:not(:first-child) {
    margin-top: 3rem;
  }
`;