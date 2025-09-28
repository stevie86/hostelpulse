import React from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import Container from 'components/Container';
import SectionTitle from 'components/SectionTitle';
import OverTitle from 'components/OverTitle';
import RichText from 'components/RichText';
import { media } from 'utils/media';
import Button from 'components/Button';

export default function PricingPage() {
  return (
    <>
      <Head>
        <title>HostelPulse — Simple, Transparent Pricing</title>
        <meta
          name="description"
          content="Simple, transparent pricing designed for hostels of all sizes. Start with our free plan and upgrade as you grow."
        />
      </Head>
      <Wrapper>
        <Container>
          <Content>
            <OverTitle>simple & transparent</OverTitle>
            <SectionTitle>Pricing That Scales With Your Business</SectionTitle>
            <RichText>
              <p>
                HostelPulse offers straightforward pricing with no hidden fees or complex tiers. 
                Start with our free plan and upgrade as your hostel grows. All plans include core features, 
                with premium features available on higher tiers.
              </p>
            </RichText>
            
            <PricingGrid>
              <PricingCard>
                <PricingHeader>
                  <PricingTitle>Starter</PricingTitle>
                  <PricingPrice>Free</PricingPrice>
                  <PricingDescription>Perfect for testing the waters</PricingDescription>
                </PricingHeader>
                <PricingFeatures>
                  <PricingFeature>Up to 50 guests</PricingFeature>
                  <PricingFeature>Up to 10 rooms</PricingFeature>
                  <PricingFeature>Basic arrival/departure tracking</PricingFeature>
                  <PricingFeature>Manual CSV import/export</PricingFeature>
                  <PricingFeature>Email support</PricingFeature>
                </PricingFeatures>
                <PricingButton>
                  <Button>Get Started</Button>
                </PricingButton>
              </PricingCard>
              
              <PricingCard highlighted>
                <PricingHeader>
                  <PricingTitle>Professional</PricingTitle>
                  <PricingPrice>€49<span>/month</span></PricingPrice>
                  <PricingDescription>For growing hostels</PricingDescription>
                </PricingHeader>
                <PricingFeatures>
                  <PricingFeature>Up to 500 guests</PricingFeature>
                  <PricingFeature>Up to 50 rooms</PricingFeature>
                  <PricingFeature>Real-time arrival/departure tracking</PricingFeature>
                  <PricingFeature>Automatic CSV import/export</PricingFeature>
                  <PricingFeature>Priority email support</PricingFeature>
                  <PricingFeature>Advanced booking conflict prevention</PricingFeature>
                  <PricingFeature>Basic reporting dashboard</PricingFeature>
                </PricingFeatures>
                <PricingButton>
                  <Button>Start Free Trial</Button>
                </PricingButton>
              </PricingCard>
              
              <PricingCard>
                <PricingHeader>
                  <PricingTitle>Enterprise</PricingTitle>
                  <PricingPrice>€99<span>/month</span></PricingPrice>
                  <PricingDescription>For large hostels & chains</PricingDescription>
                </PricingHeader>
                <PricingFeatures>
                  <PricingFeature>Unlimited guests & rooms</PricingFeature>
                  <PricingFeature>Real-time arrival/departure tracking</PricingFeature>
                  <PricingFeature>Automatic CSV import/export</PricingFeature>
                  <PricingFeature>Phone & email support</PricingFeature>
                  <PricingFeature>Advanced booking conflict prevention</PricingFeature>
                  <PricingFeature>Comprehensive reporting dashboard</PricingFeature>
                  <PricingFeature>API access</PricingFeature>
                  <PricingFeature>Multi-property management</PricingFeature>
                  <PricingFeature>Custom integrations</PricingFeature>
                </PricingFeatures>
                <PricingButton>
                  <Button>Contact Sales</Button>
                </PricingButton>
              </PricingCard>
            </PricingGrid>
            
            <FaqSection>
              <SectionTitle>Frequently Asked Questions</SectionTitle>
              <FaqGrid>
                <FaqItem>
                  <FaqQuestion>Can I switch plans anytime?</FaqQuestion>
                  <FaqAnswer>
                    Yes, you can upgrade or downgrade your plan at any time. 
                    Your billing will be prorated based on your usage.
                  </FaqAnswer>
                </FaqItem>
                
                <FaqItem>
                  <FaqQuestion>Do you offer discounts for non-profits?</FaqQuestion>
                  <FaqAnswer>
                    Absolutely! We offer special pricing for non-profit organizations and charitable hostels. 
                    Contact our sales team to discuss your specific needs.
                  </FaqAnswer>
                </FaqItem>
                
                <FaqItem>
                  <FaqQuestion>Is there a setup fee?</FaqQuestion>
                  <FaqAnswer>
                    No setup fees, ever. We believe in making great software accessible to all hostel owners 
                    without hidden costs or complicated onboarding.
                  </FaqAnswer>
                </FaqItem>
                
                <FaqItem>
                  <FaqQuestion>What payment methods do you accept?</FaqQuestion>
                  <FaqAnswer>
                    We accept all major credit cards (Visa, Mastercard, American Express) and bank transfers. 
                    Enterprise customers can also pay by invoice.
                  </FaqAnswer>
                </FaqItem>
              </FaqGrid>
            </FaqSection>
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

const PricingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 3rem;
  margin-top: 5rem;
  
  ${media('<=tablet')} {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const PricingCard = styled.div<{ highlighted?: boolean }>`
  background: rgb(var(--cardBackground));
  border-radius: 0.8rem;
  padding: 3rem;
  box-shadow: var(--shadow-md);
  border: ${(p) => (p.highlighted ? '2px solid rgb(var(--primary))' : '1px solid rgba(var(--border), 0.5)')};
  position: relative;
  
  ${media('<=tablet')} {
    padding: 2rem;
  }
  
  ${(p) =>
    p.highlighted &&
    `
      transform: scale(1.05);
      
      ${media('<=tablet')} {
        transform: scale(1);
      }
    `}
`;

const PricingHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const PricingTitle = styled.h3`
  font-size: 2.2rem;
  font-weight: bold;
  color: rgb(var(--text));
  margin-bottom: 1rem;
`;

const PricingPrice = styled.div`
  font-size: 3.2rem;
  font-weight: bold;
  color: rgb(var(--primary));
  margin-bottom: 0.5rem;
  
  span {
    font-size: 1.6rem;
    color: rgba(var(--text), 0.8);
    font-weight: normal;
  }
`;

const PricingDescription = styled.p`
  font-size: 1.6rem;
  color: rgba(var(--text), 0.8);
`;

const PricingFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 3rem;
`;

const PricingFeature = styled.li`
  font-size: 1.6rem;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(var(--border), 0.3);
  
  &:last-child {
    border-bottom: none;
  }
  
  &::before {
    content: '✓';
    color: rgb(var(--primary));
    margin-right: 1rem;
    font-weight: bold;
  }
`;

const PricingButton = styled.div`
  text-align: center;
  
  button {
    width: 100%;
    padding: 1.2rem;
  }
`;

const FaqSection = styled.div`
  margin-top: 8rem;
  
  & > *:not(:first-child) {
    margin-top: 3rem;
  }
`;

const FaqGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 3rem;
  margin-top: 3rem;
  
  ${media('<=tablet')} {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const FaqItem = styled.div`
  background: rgb(var(--cardBackground));
  border-radius: 0.8rem;
  padding: 2rem;
  box-shadow: var(--shadow-md);
`;

const FaqQuestion = styled.h4`
  font-size: 1.8rem;
  font-weight: bold;
  color: rgb(var(--text));
  margin-bottom: 1rem;
`;

const FaqAnswer = styled.p`
  font-size: 1.6rem;
  color: rgba(var(--text), 0.8);
  line-height: 1.6;
`;