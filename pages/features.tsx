import styled from 'styled-components';
import AutofitGrid from 'components/AutofitGrid';
import BasicCard from 'components/BasicCard';
import Page from 'components/Page';
import SectionTitle from 'components/SectionTitle';
import { media } from 'utils/media';

const FEATURES = [
  { imageUrl: '/grid-icons/asset-1.svg', title: 'Arrivals & Departures', description: 'See who’s coming and going today and mark check‑in/out in seconds.' },
  { imageUrl: '/grid-icons/asset-2.svg', title: 'Guests & Bookings', description: 'Add guests, create or cancel bookings, and avoid double‑bookings.' },
  { imageUrl: '/grid-icons/asset-3.svg', title: 'Import & Export', description: 'Move data from spreadsheets (CSV) and export snapshots anytime.' },
  { imageUrl: '/grid-icons/asset-4.svg', title: 'Data in the EU', description: 'Your data is hosted in the EU for peace of mind.' },
  { imageUrl: '/grid-icons/asset-5.svg', title: 'Connect your tools (optional)', description: 'Plug in other systems later. No setup needed to start.' },
  { imageUrl: '/grid-icons/asset-6.svg', title: 'Keypad Email (Soon)', description: 'Send door codes and instructions with one click.' },
  { imageUrl: '/grid-icons/asset-7.svg', title: 'Telegram Bot (Soon)', description: 'Check arrivals and update bookings from chat.' },
  { imageUrl: '/grid-icons/asset-8.svg', title: 'Multiple Properties (Soon)', description: 'Manage more than one house under one login.' },
  { imageUrl: '/grid-icons/asset-9.svg', title: 'Activity & Alerts (Soon)', description: 'See what changed and get simple alerts for late arrivals.' },
];

export default function FeaturesPage() {
  return (
    <Page title="Features" description="What you get, in plain language.">
      <Wrapper>
        <SectionTitle>Everything you need for the day</SectionTitle>
        <CustomAutofitGrid>
          {FEATURES.map((f) => (
            <BasicCard key={f.title} {...f} />
          ))}
        </CustomAutofitGrid>
      </Wrapper>
    </Page>
  );
}

const Wrapper = styled.div`
  & > *:not(:first-child) { margin-top: 6rem; }
`;

const CustomAutofitGrid = styled(AutofitGrid)`
  --autofit-grid-item-size: 40rem;
  ${media('<=tablet')} { --autofit-grid-item-size: 30rem; }
  ${media('<=phone')} { --autofit-grid-item-size: 100%; }
`;
