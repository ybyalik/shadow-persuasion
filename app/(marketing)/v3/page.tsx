
import { Libre_Baskerville, Inter } from 'next/font/google';
import Hero from './components/Hero';
import Abstract from './components/Abstract';
import TableOfContents from './components/TableOfContents';
import Methodology from './components/Methodology';
import Findings from './components/Findings';
import CaseStudies from './components/CaseStudies';
import ResearchTeam from './components/ResearchTeam';
import FAQ from './components/FAQ';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';

const libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-libre-baskerville',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function V3Page() {
  return (
    <div className={`${libreBaskerville.variable} ${inter.variable} font-sans bg-bone text-navy-deep`}>
      <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        <Hero />
        <Abstract />
        <TableOfContents />
        <Methodology />
        <Findings />
        <CaseStudies />
        <ResearchTeam />
        <FAQ />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}
