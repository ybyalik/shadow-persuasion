
import Hero from './components/Hero';
import ExecutiveSummary from './components/ExecutiveSummary';
import TableOfContents from './components/TableOfContents';
import SubjectModules from './components/SubjectModules';
import OperationalTimeline from './components/OperationalTimeline';
import Evidence from './components/Evidence';
import WitnessStatements from './components/WitnessStatements';
import PersonsOfInterest from './components/PersonsOfInterest';
import Appendix from './components/Appendix';
import FinalCTA from './components/FinalCTA';
import { Special_Elite } from 'next/font/google';

const specialElite = Special_Elite({
  weight: '400',
  subsets: ['latin'],
});

export default function V4Page() {
  return (
    <div className={`${specialElite.className} bg-[#F4ECD8] text-[#1A1A1A] bg-paper-texture`}>
      <main className="max-w-4xl mx-auto p-4 sm:p-8 md:p-12 font-mono">
        <Hero />
        <div className="space-y-16 md:space-y-24 mt-16 md:mt-24">
          <ExecutiveSummary />
          <TableOfContents />
          <SubjectModules />
          <OperationalTimeline />
          <Evidence />
          <WitnessStatements />
          <PersonsOfInterest />
          <Appendix />
          <FinalCTA />
        </div>
      </main>
    </div>
  );
}
