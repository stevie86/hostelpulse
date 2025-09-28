import 'swiper/css';
import 'swiper/css/bundle';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';

import { AppProps } from 'next/dist/shared/lib/router/router';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { ColorModeScript } from 'nextjs-color-mode';
import React, { PropsWithChildren, useState, useEffect } from 'react';
import { TinaEditProvider } from 'tinacms/dist/edit-state';

import Footer from 'components/Footer';
import { GlobalStyle } from 'components/GlobalStyles';
import Navbar from 'components/Navbar';
import NavigationDrawer from 'components/NavigationDrawer';
import NewsletterModal from 'components/NewsletterModal';
import WaveCta from 'components/WaveCta';
import { NewsletterModalContextProvider, useNewsletterModalContext } from 'contexts/newsletter-modal.context';
import { NavItems } from 'types';
import { supabase } from '../lib/supabase';



const TinaCMS = dynamic(() => import('tinacms'), { ssr: false });

function MyApp({ Component, pageProps }: AppProps) {
  const [navItems, setNavItems] = useState<NavItems>([
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Guests', href: '/guests' },
    { title: 'Bookings', href: '/bookings' },
    { title: 'Rooms', href: '/rooms' },
    { title: 'Features', href: '/features' },
    { title: 'Pricing', href: '/pricing' },
    { title: 'Login', href: '/auth/login', outlined: true },
  ]);

  // Update navigation items based on authentication status
  useEffect(() => {
    const updateNavItems = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const isLoggedIn = !!session?.user;

      if (isLoggedIn) {
        setNavItems([
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Guests', href: '/guests' },
          { title: 'Bookings', href: '/bookings' },
          { title: 'Rooms', href: '/rooms' },
          { title: 'Reports', href: '/reports' },
          { title: 'Housekeeping', href: '/housekeeping' },
          { title: 'Features', href: '/features' },
          { title: 'Pricing', href: '/pricing' },
        ]);
      } else {
        setNavItems([
          { title: 'Features', href: '/features' },
          { title: 'Pricing', href: '/pricing' },
          { title: 'Login', href: '/auth/login', outlined: true },
        ]);
      }
    };

    updateNavItems();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      updateNavItems();
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        {/* <link rel="alternate" type="application/rss+xml" href={EnvVars.URL + 'rss'} title="RSS 2.0" /> */}
        {/* <script
          dangerouslySetInnerHTML={{
            __html: `window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
          ga('create', 'UA-117119829-1', 'auto');
          ga('send', 'pageview');`,
          }}
        /> */}
        {/* <script async src="https://www.google-analytics.com/analytics.js"></script> */}
      </Head>
      <ColorModeScript />
      <GlobalStyle />

      <Providers navItems={navItems}>
        <Modals />
        <Navbar items={navItems} />
        <TinaEditProvider
          editMode={
            <TinaCMS
              query={pageProps.query}
              variables={pageProps.variables}
              data={pageProps.data}
              isLocalClient={!process.env.NEXT_PUBLIC_TINA_CLIENT_ID}
              branch={process.env.NEXT_PUBLIC_EDIT_BRANCH}
              clientId={process.env.NEXT_PUBLIC_TINA_CLIENT_ID}
              {...pageProps}
            >
              {(livePageProps: any) => <Component {...livePageProps} />}
            </TinaCMS>
          }
        >
          <Component {...pageProps} />
        </TinaEditProvider>
        <WaveCta />
        <Footer />
      </Providers>
    </>
  );
}

type ProvidersProps = {
  children: React.ReactNode;
  navItems: NavItems;
};

function Providers({ children, navItems }: ProvidersProps) {
  return (
    <NewsletterModalContextProvider>
      <NavigationDrawer items={navItems}>{children}</NavigationDrawer>
    </NewsletterModalContextProvider>
  );
}

function Modals() {
  const { isModalOpened, setIsModalOpened } = useNewsletterModalContext();
  if (!isModalOpened) {
    return null;
  }
  return <NewsletterModal onClose={() => setIsModalOpened(false)} />;
}

export default MyApp;
