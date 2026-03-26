
import { JetBrains_Mono } from 'next/font/google';
import Hero from './components/Hero';
import ScrollingTicker from './components/ScrollingTicker';
import FrameworkGrid from './components/FrameworkGrid';
import TacticalTimeline from './components/TacticalTimeline';
import MetricsDashboard from './components/MetricsDashboard';
import OperatorReports from './components/OperatorReports';
import CommandTeam from './components/CommandTeam';
import IntelFAQ from './components/IntelFAQ';
import FinalAccess from './components/FinalAccess';
import Footer from './components/Footer';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
});

export default function V2Page() {
  return (
    <div className={`${jetbrainsMono.className} bg-[#0C0C0C] text-gray-300`}>
      <div className="container mx-auto px-4">
        <Hero />
        <ScrollingTicker />
        <FrameworkGrid />
        <TacticalTimeline />
        <MetricsDashboard />
        <OperatorReports />
        <CommandTeam />
        <IntelFAQ />
        <FinalAccess />
        <Footer />
      </div>
    </div>
  );
}
