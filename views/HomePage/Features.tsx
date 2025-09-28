import React from 'react';
import styled from 'styled-components';
import AutofitGrid from 'components/AutofitGrid';
import BasicCard from 'components/BasicCard';
import Container from 'components/Container';
import { media } from 'utils/media';

const FEATURES = [
  {
    imageUrl: '/grid-icons/asset-1.svg',
    title: 'Real-Time Arrivals & Departures',
    description: 'Instant visibility into check-ins/outs with one-click status updates.',
  },
  {
    imageUrl: '/grid-icons/asset-2.svg',
    title: 'Smart Guest & Booking Management',
    description: 'Add guests, create/cancel bookings, and automatically prevent double-bookings.',
  },
  {
    imageUrl: '/grid-icons/asset-3.svg',
    title: 'Seamless CSV Import/Export',
    description: 'Transition from spreadsheets in minutes; export data snapshots anytime.',
  },
  {
    imageUrl: '/grid-icons/asset-4.svg',
    title: 'EU-Hosted Secure Backend',
    description: 'Built on Supabase infrastructure hosted in the EU with strict server-side controls.',
  },
  {
    imageUrl: '/grid-icons/asset-5.svg',
    title: 'Developer API Access',
    description: 'RESTful endpoints to integrate with your existing tooling and workflows.',
  },
  {
    imageUrl: '/grid-icons/asset-6.svg',
    title: 'Keypad Email (Coming Soon)',
    description: 'Automatically send guests door codes and stay instructions with one click.',
  },
  {
    imageUrl: '/grid-icons/asset-7.svg',
    title: 'Telegram Bot (Coming Soon)',
    description: 'Manage daily operations from chat with commands like /today, /checkin, /sendcode.',
  },
  {
    imageUrl: '/grid-icons/asset-8.svg',
    title: 'Multi-Property Support (Coming Soon)',
    description: 'Owner-scoped access with Row Level Security for managing multiple properties.',
  },
  {
    imageUrl: '/grid-icons/asset-9.svg',
    title: 'Audit Trail & Alerts (Coming Soon)',
    description: 'Comprehensive action logs and smart alerts for late arrivals and other events.',
  },
];

export default function Features() {
  return (
    <Container>
      <CustomAutofitGrid>
        {FEATURES.map((singleFeature, idx) => (
          <BasicCard key={singleFeature.title} {...singleFeature} />
        ))}
      </CustomAutofitGrid>
    </Container>
  );
}

const CustomAutofitGrid = styled(AutofitGrid)`
  --autofit-grid-item-size: 40rem;

  ${media('<=tablet')} {
    --autofit-grid-item-size: 30rem;
  }

  ${media('<=phone')} {
    --autofit-grid-item-size: 100%;
  }
`;
