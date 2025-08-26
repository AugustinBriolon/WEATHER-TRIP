import type { NextPage } from 'next';
import Head from 'next/head';
import { TripPlanner } from '@/components/TripPlanner';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Planificateur Météo Randonnée</title>
        <meta
          name='description'
          content='Planifiez vos randonnées avec les prévisions météo'
        />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className='min-h-screen bg-gradient-to-br from-green-50 to-blue-50'>
        <TripPlanner />
      </main>
    </>
  );
};

export default Home;
