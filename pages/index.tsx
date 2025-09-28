import { InferGetStaticPropsType } from 'next';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styled from 'styled-components';
import BasicSection from 'components/BasicSection';
import { getAllPosts } from 'utils/postsFetcher';
import Cta from 'views/HomePage/Cta';
import Features from 'views/HomePage/Features';
import FeaturesGallery from 'views/HomePage/FeaturesGallery';
import Hero from 'views/HomePage/Hero';
import Partners from 'views/HomePage/Partners';
import ScrollableBlogPosts from 'views/HomePage/ScrollableBlogPosts';
import Testimonials from 'views/HomePage/Testimonials';
import { supabase } from '../lib/supabase';

export default function Homepage({ posts }: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        router.push('/dashboard');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <>
      <Head>
        <title>Hostelpulse — Owner Console</title>
        <meta
          name="description"
          content="Streamline hostel operations with real-time arrivals/departures tracking, smart booking management, and EU-hosted secure backend. Built for modern hostel owners."
        />
      </Head>
      <HomepageWrapper>
        <WhiteBackgroundContainer>
          <Hero />
          <Partners />
          <BasicSection imageUrl="/demo-illustration-1.svg" title="Real-Time Arrivals & Departures" overTitle="Daily Operations">
            <p>
              Instantly see today's check-ins and check-outs with one-click status updates. 
              Keep your entire team synchronized across all channels without hunting through spreadsheets.
            </p>
          </BasicSection>
          <BasicSection imageUrl="/demo-illustration-2.svg" title="Smart Guest & Booking Management" overTitle="Core Features" reversed>
            <p>
              Effortlessly add guests, create or cancel bookings, and automatically prevent double-bookings 
              with intelligent conflict detection for both private rooms and dormitory beds.
            </p>
            <ul>
              <li>Support for private rooms and shared dormitory beds</li>
              <li>Lightning-fast guest creation and updates</li>
              <li>Clear visual indicators for empty, error, and loading states</li>
            </ul>
          </BasicSection>
        </WhiteBackgroundContainer>
        <DarkerBackgroundContainer>
          <Cta />
          <FeaturesGallery />
          <Features />
          <Testimonials />
          <ScrollableBlogPosts posts={posts} />
        </DarkerBackgroundContainer>
      </HomepageWrapper>
    </>
  );
}

const HomepageWrapper = styled.div`
  & > :last-child {
    margin-bottom: 15rem;
  }
`;

const DarkerBackgroundContainer = styled.div`
  background: rgb(var(--background));

  & > *:not(:first-child) {
    margin-top: 15rem;
  }
`;

const WhiteBackgroundContainer = styled.div`
  background: rgb(var(--secondBackground));

  & > :last-child {
    padding-bottom: 15rem;
  }

  & > *:not(:first-child) {
    margin-top: 15rem;
  }
`;

export async function getStaticProps() {
  return {
    props: {
      posts: await getAllPosts(),
    },
  };
}
