import styled from 'styled-components';
import AutofitGrid from 'components/AutofitGrid';
import BasicCard from 'components/BasicCard';
import Page from 'components/Page';
import SectionTitle from 'components/SectionTitle';
import YoutubeVideo from 'components/YoutubeVideo';
import { media } from 'utils/media';

const FEATURES = [
  {
    imageUrl: '/grid-icons/asset-1.svg',
    title: 'Arrivals & Departures (Owner Dashboard)',
    description: 'See today’s check‑ins/outs at a glance and update status with one click.',
    status: 'Implemented' as const,
  },
  {
    imageUrl: '/grid-icons/asset-2.svg',
    title: 'Guests Management',
    description: 'Add guests and keep contact details organized for fast check‑ins.',
    status: 'Implemented' as const,
  },
  {
    imageUrl: '/grid-icons/asset-3.svg',
    title: 'Bookings Management + Overlap Protection',
    description: 'Create/cancel/check‑in/out bookings; overlapping stays are prevented.',
    status: 'Implemented' as const,
  },
  {
    imageUrl: '/grid-icons/asset-4.svg',
    title: 'CSV Import/Export',
    description: 'Migrate from Google Sheets quickly; import guests/bookings and export snapshots.',
    status: 'Implemented' as const,
  },
  {
    imageUrl: '/grid-icons/asset-5.svg',
    title: 'EU‑Hosted Supabase Backend',
    description: 'Data hosted in the EU with strict RLS via server‑side APIs.',
    status: 'Implemented' as const,
  },
  {
    imageUrl: '/grid-icons/asset-6.svg',
    title: 'API Documentation (/api-docs)',
    description: 'Static OpenAPI docs with Redoc for quick reference and integration.',
    status: 'Implemented' as const,
  },
  {
    imageUrl: '/grid-icons/asset-7.svg',
    title: 'Keypad Instructions via Email',
    description: 'Send guests check‑in codes and “how to use” steps in one click (SendGrid).',
    status: 'Coming Soon' as const,
  },
  {
    imageUrl: '/grid-icons/asset-8.svg',
    title: 'Telegram Ops Bot',
    description: 'Chat commands for /today, /checkin <id>, /checkout <id>, /sendcode <id>.',
    status: 'Coming Soon' as const,
  },
  {
    imageUrl: '/grid-icons/asset-9.svg',
    title: 'Multi‑House Owner Scoping',
    description: 'Owner auth, per‑house scoping, and RLS‑backed access controls.',
    status: 'Coming Soon' as const,
  },
];

export default function FeaturesPage() {
  return (
    <Page
      title="Features"
      description="Practical tools for hostel owners: daily ops today, integrations tomorrow."
    >
      <Wrapper>
        <SectionTitle>What’s live and what’s next</SectionTitle>
        <CustomAutofitGrid>
          {FEATURES.map((singleFeature) => (
            <BasicCard key={singleFeature.title} {...singleFeature} />
          ))}
        </CustomAutofitGrid>
      </Wrapper>
    </Page>
  );
}

const Wrapper = styled.div`
  & > *:not(:first-child) {
    margin-top: 10rem;
  }
`;

const CustomAutofitGrid = styled(AutofitGrid)`
  --autofit-grid-item-size: 40rem;

  ${media('<=tablet')} {
    --autofit-grid-item-size: 30rem;
  }

  ${media('<=phone')} {
    --autofit-grid-item-size: 100%;
  }
`;
