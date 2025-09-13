import styled from 'styled-components'
import Page from 'components/Page'
import RichText from 'components/RichText'

export default function CookiesPolicyPage() {
  return (
    <Page title="Cookies Policy">
      <CookiesPolicyContainer>
        <RichText>
          <p>
            We use a minimal set of cookies necessary to run the owner console and keep you signed in. No tracking or advertising cookies
            are used for the MVP.
          </p>
          <br />
          <strong>Cookies we use</strong>
          <ul>
            <li>Session cookie (essential): keeps you signed in while using the console</li>
            <li>CSRF protection (essential): protects form submissions</li>
          </ul>
          <br />
          <p>This page is a simple placeholder policy for demo purposes. Replace with your legal policy before production.</p>
        </RichText>
      </CookiesPolicyContainer>
    </Page>
  );
}

const CookiesPolicyContainer = styled.div`
  max-width: 90rem;
  margin: auto;
  overflow-x: auto;
`;
