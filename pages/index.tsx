import Head from 'next/head';
import ComingSoonHero from 'components/ComingSoonHero';
import FeaturesSection from 'components/FeaturesSection';
import CTASection from 'components/CTASection';
import { EnvVars } from 'env';

export default function ComingSoonPage() {
  return (
    <>
      <Head>
        <title>{EnvVars.SITE_NAME} - Coming Soon</title>
        <meta
          name="description"
          content="Hostelpulse is coming soon. The all-in-one platform for modern hostel management."
        />
      </Head>
      <ComingSoonHero />
      <FeaturesSection />
      <CTASection />
    </>
  );
}


