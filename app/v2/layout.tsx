import type { Metadata } from 'next';
import { Courier_Prime, EB_Garamond, Inter, Source_Serif_4 } from 'next/font/google';
import './v2.css';
import { FunnelTracker } from './_components/FunnelTracker';

// Reading text: Source Serif 4 (sturdy on screens). Headlines: EB Garamond, the book's face.
// Labels: Courier Prime. Forms: Inter.
const serif = Source_Serif_4({ subsets: ['latin'], variable: '--font-sp2-serif', display: 'swap' });
const display = EB_Garamond({ subsets: ['latin'], variable: '--font-sp2-display', display: 'swap', style: ['normal', 'italic'] });
const ui = Inter({ subsets: ['latin'], variable: '--font-sp2-ui', display: 'swap' });
const type = Courier_Prime({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-sp2-type', display: 'swap' });

// Hidden from search engines and not linked from the live site while the
// v2 offer is being tested.
export const metadata: Metadata = {
  title: 'Shadow Persuasion: The Hidden Rules of Power',
  description:
    'A book and 21-day reset for capable, kind people: see the hidden rules that decide who gets their way, stop unfair pressure, and ask for what you want in the open.',
  robots: { index: false, follow: false },
};

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`sp2 ${serif.variable} ${display.variable} ${ui.variable} ${type.variable}`}>
      {/* First, so the landing page is saved before any page's own tracking runs. */}
      <FunnelTracker />
      {children}
    </div>
  );
}
