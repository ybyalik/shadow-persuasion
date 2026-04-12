'use client';

import { Special_Elite } from 'next/font/google';
import DossierAnalysis from '../homepage-components/DossierAnalysis';
import InfluenceDecoder from '../homepage-components/InfluenceDecoder';
import CaseFileBrowser from '../homepage-components/CaseFileBrowser';
import MeasuredImpact from '../homepage-components/MeasuredImpact';

const specialElite = Special_Elite({ subsets: ['latin'], weight: '400' });

export default function SectionsPage() {
  return (
    <main className={`${specialElite.className} bg-[#F4ECD8] text-[#1A1A1A]`}>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Unused Sections Archive</h1>
        <p className="text-gray-500 mb-8">These sections were removed from the homepage but preserved here for reference.</p>
      </div>

      <div className="border-t-4 border-dashed border-[#D4A017]/30 my-8" />
      <div className="max-w-5xl mx-auto px-6 py-4">
        <h2 className="text-sm font-mono uppercase tracking-widest text-[#D4A017]">Section: Dossier Analysis</h2>
      </div>
      <DossierAnalysis />

      <div className="border-t-4 border-dashed border-[#D4A017]/30 my-8" />
      <div className="max-w-5xl mx-auto px-6 py-4">
        <h2 className="text-sm font-mono uppercase tracking-widest text-[#D4A017]">Section: Influence Decoder</h2>
      </div>
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <InfluenceDecoder />
      </div>

      <div className="border-t-4 border-dashed border-[#D4A017]/30 my-8" />
      <div className="max-w-5xl mx-auto px-6 py-4">
        <h2 className="text-sm font-mono uppercase tracking-widest text-[#D4A017]">Section: Case File Browser</h2>
      </div>
      <CaseFileBrowser />

      <div className="border-t-4 border-dashed border-[#D4A017]/30 my-8" />
      <div className="max-w-5xl mx-auto px-6 py-4">
        <h2 className="text-sm font-mono uppercase tracking-widest text-[#D4A017]">Section: Measured Impact</h2>
      </div>
      <MeasuredImpact />
    </main>
  );
}
