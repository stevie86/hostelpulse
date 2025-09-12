import React from 'react';
import styled from 'styled-components';
import AutofitGrid from 'components/AutofitGrid';
import BasicCard from 'components/BasicCard';
import Container from 'components/Container';
import { media } from 'utils/media';

const FEATURES = [
  {
    imageUrl: '/grid-icons/asset-1.svg',
    title: 'Arrivals & Departures',
    description: 'See today’s check‑ins/outs and update status instantly.',
  },
  {
    imageUrl: '/grid-icons/asset-2.svg',
    title: 'Guests & Bookings',
    description: 'Add guests, create/cancel bookings, and prevent overlaps.',
  },
  {
    imageUrl: '/grid-icons/asset-3.svg',
    title: 'CSV Import/Export',
    description: 'Move from spreadsheets in minutes; export snapshots anytime.',
  },
  {
    imageUrl: '/grid-icons/asset-4.svg',
    title: 'EU‑Hosted Backend',
    description: 'Supabase in the EU with strict server‑side writes.',
  },
  {
    imageUrl: '/grid-icons/asset-5.svg',
    title: 'API Docs',
    description: 'Browse endpoints at /api-docs for integration details.',
  },
  {
    imageUrl: '/grid-icons/asset-6.svg',
    title: 'Keypad Email (Soon)',
    description: 'Send guests codes and instructions with one click.',
  },
  {
    imageUrl: '/grid-icons/asset-7.svg',
    title: 'Telegram Bot (Soon)',
    description: 'Manage ops from chat: /today, /checkin, /sendcode.',
  },
  {
    imageUrl: '/grid-icons/asset-8.svg',
    title: 'Multi‑House (Soon)',
    description: 'Owner scoping + RLS for multiple properties.',
  },
  {
    imageUrl: '/grid-icons/asset-9.svg',
    title: 'Audit & Alerts (Soon)',
    description: 'Action logs and basic alerts for late arrivals.',
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
