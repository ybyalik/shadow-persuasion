'use client';

import { Special_Elite } from 'next/font/google';
import CoverPage from './components/CoverPage';
import ExecutiveSummary from './components/ExecutiveSummary';
import TableOfContents from './components/TableOfContents';
import SubjectFiles from './components/SubjectFiles';
import Evidence from './components/Evidence';
import Statements from './components/Statements';
import PersonsOfInterest from './components/PersonsOfInterest';
import FAQ from './components/FAQ';
import AccessRequest from './components/AccessRequest';
import Footer from './components/Footer';

const specialElite = Special_Elite({ subsets: ['latin'], weight: '400' });

export default function V4Page() {
  return (
    <main className={`${specialElite.className} noise-texture`}>
      <CoverPage />
      <div className="max-w-4xl mx-auto p-8 md:p-12 space-y-24">
        <ExecutiveSummary />
        <TableOfContents />
        <SubjectFiles />
        <Evidence />
        <Statements />
        <PersonsOfInterest />
        <FAQ />
        <AccessRequest />
      </div>
      <Footer />
    </main>
  );
}
