'use client';

import { ArrowRight } from 'lucide-react';

const CoverPage = () => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-center p-8 overflow-hidden">
      <div className="absolute top-8 right-8 z-10">
        <p className="text-red-700 text-3xl font-bold border-4 border-red-700 p-2 transform -rotate-12 opacity-60 origin-center scale-110">CLASSIFIED</p>
        <p className="text-blue-700 text-3xl font-bold border-4 border-blue-700 p-2 transform rotate-12 origin-center absolute top-4 -left-4 scale-125">DECLASSIFIED</p>
      </div>

      <div className="z-0">
        <p className="text-sm uppercase tracking-widest">DOC-SP-2026-001 // EYES ONLY</p>
        <h1 className="text-6xl md:text-8xl font-bold my-4">PROJECT: SHADOW PERSUASION</h1>
        <p className="text-xl md:text-2xl text-gray-800">A Comprehensive Field Manual for Psychological Influence Operations</p>

        <div className="mt-12 text-lg">
          <p>DISTRIBUTION: LIMITED</p>
          <p>HANDLING: NEED-TO-KNOW BASIS</p>
        </div>

        <div className="flex items-center justify-center space-x-3 mt-12">
          <div className="w-6 h-6 border-2 border-black flex items-center justify-center text-2xl font-bold text-black">✓</div>
          <span>I accept responsibility for the contents of this document</span>
        </div>

        <button className="mt-8 bg-black text-white py-3 px-8 text-lg font-bold flex items-center justify-center mx-auto hover:bg-gray-800 transition-colors duration-300">
          PROCEED TO DOCUMENT <ArrowRight className="ml-2" />
        </button>
      </div>

      <div className="absolute bottom-[-50px] right-[-50px] w-48 h-48 bg-radial-gradient from-yellow-800/20 to-transparent rounded-full opacity-30"></div>
    </div>
  );
};

export default CoverPage;
