import { Hero } from './components/Hero';
import { Capabilities } from './components/Capabilities';
import { ConsolePreview } from './components/ConsolePreview';
import { Modules } from './components/Modules';
import { Metrics } from './components/Metrics';
import { Pricing } from './components/Pricing';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { JetBrains_Mono, Inter } from 'next/font/google';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function V2Page() {
  return (
    <main className={`${jetbrainsMono.variable} ${inter.variable} font-sans`}>
      <Hero />
      <Capabilities />
      <ConsolePreview />
      <Modules />
      <Metrics />
      <Pricing />
      <FinalCTA />
      <Footer />
    </main>
  );
}
