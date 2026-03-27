'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const modules = [
  {
    id: 'MOD-001',
    title: 'Negotiation Warfare',
    description: 'AI-powered negotiation coaching with real-time script generation.',
  },
  {
    id: 'MOD-002',
    title: 'Frame Control Lab',
    description: 'Practice frame control techniques with AI-simulated scenarios.',
  },
  {
    id: 'MOD-003',
    title: 'Persuasion Scripts',
    description: 'Library of proven scripts for sales, dating, leadership, conflict.',
  },
  {
    id: 'MOD-004',
    title: 'Body Language Decoder',
    description: 'Upload photos for AI analysis of micro-expressions and power signals.',
  },
  {
    id: 'MOD-005',
    title: 'Psychological Profiling',
    description: 'Build detailed profiles of targets using behavioral data.',
  },
  {
    id: 'MOD-006',
    title: 'Dark Pattern Library',
    description: '50+ influence patterns with AI deployment guidance.',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};


export const Modules = () => {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });
    
  return (
    <section ref={ref} className="bg-[#0A0A0A] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-mono text-base font-semibold uppercase tracking-widest text-[#FF8C00]">
            Operational Modules
          </h2>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 md:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {modules.map((module, index) => (
            <motion.div
                key={module.id}
                variants={cardVariants}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="flex flex-col rounded-xl border border-[#333] bg-[#111] p-8"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-gray-400">{module.id}</span>
                <span className="rounded-full bg-green-900/50 px-3 py-1 text-xs font-semibold text-green-400">FULL ACCESS</span>
              </div>
              <h3 className="mt-6 font-mono text-lg font-semibold uppercase tracking-wider text-white">
                {module.title}
              </h3>
              <p className="mt-4 text-base text-gray-400">{module.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
