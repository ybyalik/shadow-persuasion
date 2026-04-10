'use client';

import { Special_Elite } from 'next/font/google';
import CoverPage from './homepage-components/CoverPage';
import ExecutiveSummary from './homepage-components/ExecutiveSummary';
import { SystemCapabilities } from './homepage-components/SystemCapabilities';
import AppPreview from './homepage-components/AppPreview';
import { SystemPreview } from './homepage-components/SystemPreview';
import InfluenceDecoder from './homepage-components/InfluenceDecoder';
import LiveAnalysisDemo from './homepage-components/LiveAnalysisDemo';
import DossierAnalysis from './homepage-components/DossierAnalysis';
import ConversationBreakdown from './homepage-components/ConversationBreakdown';
import CaseFileBrowser from './homepage-components/CaseFileBrowser';
import ScenarioSimulator from './homepage-components/ScenarioSimulator';
import { OperationalModules } from './homepage-components/OperationalModules';
import Evidence from './homepage-components/Evidence';
import MeasuredImpact from './homepage-components/MeasuredImpact';
import ProgressionPath from './homepage-components/ProgressionPath';
import DarkPatternRolodex from './homepage-components/DarkPatternRolodex';
import Statements from './homepage-components/Statements';
import ClassifiedComparison from './homepage-components/ClassifiedComparison';
import FAQ from './homepage-components/FAQ';
import AccessRequest from './homepage-components/AccessRequest';
import Footer from './homepage-components/Footer';
import SectionDivider from './homepage-components/SectionDivider';

const specialElite = Special_Elite({ subsets: ['latin'], weight: '400' });

export default function HomePage() {
  return (
    <main className={`${specialElite.className} bg-[#F4ECD8] text-[#1A1A1A]`}>
      {/* 1. CoverPage */}
      <CoverPage />

      {/* 2. ExecutiveSummary */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16 md:space-y-20 py-16">
        <ExecutiveSummary />
      </div>

      {/* 3. SectionDivider */}
      <SectionDivider text="// STRATEGIC COMMUNICATION TRAINING — PUBLIC ACCESS //" />

      {/* 4. SystemCapabilities */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16 md:space-y-20 py-16">
        <SystemCapabilities />
      </div>

      {/* 5. AppPreview */}
      <AppPreview />

      {/* 6. SystemPreview (Exhibit B) */}
      <SystemPreview />

      {/* 7. InfluenceDecoder (Exhibit D) */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16 md:space-y-20 py-16">
        <InfluenceDecoder />
      </div>

      {/* 8. LiveAnalysisDemo */}
      <LiveAnalysisDemo />

      {/* 9. DossierAnalysis */}
      <DossierAnalysis />

      {/* 10. ConversationBreakdown (Evidence C-1) */}
      <ConversationBreakdown />

      {/* 11. CaseFileBrowser (Archived Operations) */}
      <CaseFileBrowser />

      {/* 12. ScenarioSimulator */}
      <ScenarioSimulator />

      {/* 13. SectionDivider */}
      <SectionDivider text="// SUCCESS METRICS — VERIFIED RESULTS //" />

      {/* 14. OperationalModules (Appendix A) */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16 md:space-y-20 py-16">
        <OperationalModules />
      </div>

      {/* 15. Evidence */}
      <Evidence />

      {/* 16-18. MeasuredImpact, ProgressionPath, DarkPatternRolodex */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16 md:space-y-20 py-16">
        <MeasuredImpact />
        <ProgressionPath />
        <DarkPatternRolodex />
      </div>

      {/* 19. Statements (Personnel Files / Testimonials) */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16 md:space-y-20 py-16">
        <Statements />
      </div>

      {/* 21. ClassifiedComparison (Document Comparison) */}
      <ClassifiedComparison />

      {/* 22. FAQ */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16 md:space-y-20 py-16">
        <FAQ />
      </div>

      {/* 23. AccessRequest (Form SP-2026) */}
      <AccessRequest />

      {/* 24. Footer */}
      <Footer />
    </main>
  );
}
