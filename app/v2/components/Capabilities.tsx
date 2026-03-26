'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { BrainCircuit, Eye, MenuSquare } from 'lucide-react';

const capabilities = [
  {
    icon: <BrainCircuit className="h-8 w-8 text-[#FF8C00]" />,
    title: 'AI OPERATOR CONSOLE',
    description:
      'Real-time AI guidance for negotiations, conversations, and high-stakes encounters. Feed it context. Get tactical responses.',
  },
  {
    icon: <Eye className="h-8 w-8 text-[#FF8C00]" />,
    title: 'VISUAL INTELLIGENCE',
    description:
      'Upload screenshots, body language photos, or conversation logs. AI decodes what others miss — micro-expressions, power dynamics, hidden intent.',
  },
  {
    icon: <MenuSquare className="h-8 w-8 text-[#FF8C00]" />,
    title: 'DARK PSYCHOLOGY ENGINE',
    description:
      '50+ influence frameworks. Pattern interruption, frame control, anchoring, the void pull. Learn the system. Deploy the tactics.',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

export const Capabilities = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <section ref={ref} className="bg-[#0A0A0A] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-mono text-base font-semibold uppercase tracking-widest text-[#FF8C00]">
            System Capabilities
          </h2>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {capabilities.map((capability, index) => (
            <motion.div
              key={capability.title}
              variants={cardVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="flex flex-col rounded-xl border border-[#333] bg-[#111] p-8 transition-all duration-300 hover:border-[#FF8C00] hover:shadow-[0_0_20px_rgba(255,140,0,0.3)]"
            >
              <div className="mb-6">{capability.icon}</div>
              <h3 className="font-mono text-lg font-semibold uppercase tracking-wider text-white">
                {capability.title}
              </h3>
              <p className="mt-4 text-base text-gray-400">
                {capability.description}
              </p>
              <div className="mt-6 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="font-mono text-xs uppercase text-green-400">
                  Status: Online
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
