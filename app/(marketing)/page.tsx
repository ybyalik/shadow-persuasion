'use client';

import { Special_Elite } from 'next/font/google';
import CoverPage from './homepage-components/CoverPage';
import ExecutiveSummary from './homepage-components/ExecutiveSummary';
import { SystemCapabilities } from './homepage-components/SystemCapabilities';
import { SystemPreview } from './homepage-components/SystemPreview';
import TableOfContents from './homepage-components/TableOfContents';
import SubjectFiles from './homepage-components/SubjectFiles';
import { OperationalModules } from './homepage-components/OperationalModules';
import ScenarioSimulator from './homepage-components/ScenarioSimulator';
import InfluenceDecoder from './homepage-components/InfluenceDecoder';
import ProgressionPath from './homepage-components/ProgressionPath';
import DarkPatternRolodex from './homepage-components/DarkPatternRolodex';
import DeploymentFeed from './homepage-components/DeploymentFeed';
import FieldAssessment from './homepage-components/FieldAssessment';
import Evidence from './homepage-components/Evidence';
import Statements from './homepage-components/Statements';
import { Architects } from './homepage-components/Architects';
import FAQ from './homepage-components/FAQ';
import ClassifiedComparison from './homepage-components/ClassifiedComparison';
import AccessRequest from './homepage-components/AccessRequest';
import Footer from './homepage-components/Footer';
import SectionDivider from './homepage-components/SectionDivider';
import LiveAnalysisDemo from './homepage-components/LiveAnalysisDemo';
import CaseFileBrowser from './homepage-components/CaseFileBrowser';
import DossierAnalysis from './homepage-components/DossierAnalysis';
import ConversationBreakdown from './homepage-components/ConversationBreakdown';
import MeasuredImpact from './homepage-components/MeasuredImpact';

const specialElite = Special_Elite({ subsets: ['latin'], weight: '400' });

export default function HomePage() {
  return (
    <main className={`${specialElite.className} bg-[#F4ECD8] text-[#1A1A1A]`}>
      <CoverPage />
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16 md:space-y-20 py-16">
        <ExecutiveSummary />
      </div>
      
      <SectionDivider text="// STRATEGIC COMMUNICATION TRAINING — PUBLIC ACCESS //" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16 md:space-y-20 py-16">
        <SystemCapabilities />
        <SystemPreview />
      </div>
      
      <SectionDivider text="// PRACTICAL APPLICATIONS — MULTIPLE DOMAINS //" />
      
      <ScenarioSimulator />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16 md:space-y-20 py-16">
        <InfluenceDecoder />
      </div>

      <LiveAnalysisDemo />
      <DossierAnalysis />

      <SectionDivider text="// TRAINING MODULES — COMPREHENSIVE ACCESS //" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16 md:space-y-20 py-16">
        <TableOfContents />
        <SubjectFiles />
      </div>

      <CaseFileBrowser />

      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16 md:space-y-20 py-16">
        <OperationalModules />
      </div>

      <SectionDivider text="// SUCCESS METRICS — VERIFIED RESULTS //" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16 md:space-y-20 py-16">
        <ProgressionPath />
        <DarkPatternRolodex />
      </div>
      
      <DeploymentFeed />

      <SectionDivider text="// STUDENT OUTCOMES — DOCUMENTED EVIDENCE //" />

      <Evidence />

      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16 md:space-y-20 py-16">
        <MeasuredImpact />
        <ConversationBreakdown />
        <Statements />
        <Architects />
      </div>

      <SectionDivider text="// PROGRAM ACCESS — ENROLLMENT INFORMATION //" />

      <FieldAssessment />

      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16 md:space-y-20 py-16">
        <FAQ />
      </div>

      <ClassifiedComparison />
      <AccessRequest />
      
      <Footer />
    </main>
  );
}