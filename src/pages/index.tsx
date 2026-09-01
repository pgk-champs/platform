import React from 'react';
import Layout from '@theme/Layout';
import HomeHero from '../components/HomeHero';

export default function Home() {
  return (
    <Layout
      title="PGK Champs"
      description="От нуля до чемпиона: мобильная разработка и блокчейн"
    >
      <main>
        <HomeHero />
      </main>
    </Layout>
  );
}
