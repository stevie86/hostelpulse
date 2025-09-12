import styled from 'styled-components'
import Page from 'components/Page'
import RichText from 'components/RichText'
import Link from 'next/link'

export default function PrivacyPolicyPage() {
  return (
    <Page title="Privacy Policy">
      <PrivacyPolicyContainer>
        <RichText>
          <p>
            Hostelpulse collects only the minimum data required to operate the owner console: guest contact details and booking
            information that you provide. Data is stored in an EU‑hosted Supabase project. We do not sell your data or use it for
            advertising.
          </p>
          <br />
          <strong>What we collect</strong>
          <ul>
            <li>Guests: name, email, phone, nationality (optional)</li>
            <li>Bookings: check‑in/out dates, amounts, status, associated hostel</li>
          </ul>
          <br />
          <strong>Data location & retention</strong>
          <p>
            Your data is stored in the European Union. You can delete guests/bookings at any time from the console. For removal requests,
            contact us.
          </p>
          <br />
          <p>
            This policy is for demo purposes. Replace with your legal policy before production. See also our{' '}
            <Link href="/cookies-policy">Cookies Policy</Link>.
          </p>
        </RichText>
      </PrivacyPolicyContainer>
    </Page>
  );
}

const PrivacyPolicyContainer = styled.div`
  max-width: 90rem;
  margin: auto;
  overflow-x: auto;
`;
