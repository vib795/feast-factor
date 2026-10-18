import '@/styles/globals.css';
import Head from 'next/head';
import { Bricolage_Grotesque, Hanken_Grotesk, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const body = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export default function App({ Component, pageProps }) {
  return (
    <div className={`${display.variable} ${body.variable} ${mono.variable} font-body`}>
      <Head>
        <title>Feast Factor — Daily Macro Calculator</title>
        <meta
          name="description"
          content="Dial in precision daily nutrition targets — calories, protein, carbs and fat — tuned to your body, activity level and goal."
        />
        <meta name="theme-color" content="#0b0b0c" />
        <meta property="og:title" content="Feast Factor — Daily Macro Calculator" />
        <meta
          property="og:description"
          content="Precision daily macros tuned to your body and goal."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </Head>
      <Component {...pageProps} />
      <Analytics />
      <SpeedInsights />
    </div>
  );
}
