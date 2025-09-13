import React from 'react';
import styled from 'styled-components';
import Container from 'components/Container';
import SectionTitle from 'components/SectionTitle';
import Separator from 'components/Separator';

export default function HelpPage() {
  return (
    <Container>
      <Wrapper>
        <SectionTitle>Help & Guides</SectionTitle>
        <Intro>
          Quick answers to common tasks. For advanced details (CSV formats, edge cases), see the detailed docs linked in each section.
        </Intro>
        <Separator />
        <Section>
          <H3>Arrivals & Departures</H3>
          <List>
            <li>Tap a guest to view details and check-in/out.</li>
            <li>Use the search to find bookings by name or date.</li>
            <li>Conflicts are highlighted — adjust dates to resolve.</li>
          </List>
        </Section>
        <Section>
          <H3>Bookings</H3>
          <List>
            <li>Create a booking with guest, dates, and notes.</li>
            <li>Overlaps are blocked automatically to prevent errors.</li>
            <li>Export CSV anytime to share or back up data.</li>
          </List>
        </Section>
        <Section>
          <H3>Guests</H3>
          <List>
            <li>Add guests quickly with name and contact info.</li>
            <li>Update later with nationality and notes.</li>
            <li>Import from your spreadsheet to get started fast.</li>
          </List>
        </Section>
      </Wrapper>
    </Container>
  );
}

const Wrapper = styled.div`
  padding: 3.2rem 0;
`;

const Intro = styled.p`
  margin: 0.8rem 0 1.6rem;
  opacity: 0.9;
`;

const Section = styled.section`
  margin: 2.4rem 0 1.2rem;
`;

const H3 = styled.h3`
  font-size: 2rem;
  margin: 0 0 0.6rem;
`;

const List = styled.ul`
  margin: 0;
  padding-left: 1.6rem;
  & > li { margin: 0.4rem 0; }
`;

