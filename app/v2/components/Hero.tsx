'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export const Hero = () => {
  return (
    <div className="relative flex h-screen min-h-[700px] flex-col items-center justify-center overflow-hidden bg-[#0A0A0A]">
      <div className="absolute inset-0 z-0 opacity-10">
        {/* Faint grid pattern */}
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
      </div>
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="font-mono text-xs uppercase tracking-widest text-[#FF8C00]">
          SYSTEM STATUS: ACTIVE | CLEARANCE: PENDING | OPERATOR: UNIDENTIFIED
        </div>
      </div>
      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="mb-4 font-mono text-sm uppercase tracking-[0.2em] text-[#FF8C00]">
            SHADOW PERSUASION // v2.0
          </p>
          <h1 className="font-mono text-6xl font-bold leading-tight text-white md:text-8xl lg:text-9xl">
            THE OPERATOR'S <br /> PLAYBOOK
          </h1>
          <p className="mt-4 text-lg text-green-400 md:text-xl">
            AI-Powered Psychological Warfare for the Modern Operator
          </p>
          <div className="mt-6 h-6 font-mono text-base text-gray-400">
            {/* Typewriter effect would be implemented here */}
            Dark psychology. Decoded by AI. Deployed by you.
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-8 flex gap-4"
        >
          <button className="border border-[#FF8C00] bg-transparent px-6 py-3 font-mono text-sm uppercase text-[#FF8C00] transition-colors hover:bg-[#FF8C00] hover:text-black">
            [INITIATE ACCESS]
          </button>
          <button className="border border-gray-600 bg-transparent px-6 py-3 font-mono text-sm uppercase text-gray-400 transition-colors hover:bg-gray-800 hover:text-white">
            [PREVIEW SYSTEM]
          </button>
        </motion.div>
      </div>
      <div className="absolute bottom-4 z-10">
        <ChevronDown className="h-8 w-8 animate-bounce text-gray-600" />
      </div>
    </div>
  );
};
