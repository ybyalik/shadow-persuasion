'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export const FinalCTA = () => {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.5,
    });
  return (
    <section ref={ref} className="bg-black py-24 sm:py-32">
      <div className="mx-auto max-w-4xl text-center px-6 lg:px-8">
        <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="font-mono text-4xl font-bold uppercase tracking-wider text-white md:text-5xl"
        >
          Authorization Required
        </motion.h2>
        <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-gray-400"
        >
          This system is designed for operators who understand that knowledge is leverage.
        </motion.p>
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-10"
        >
          <button className="bg-[#FF8C00] px-8 py-4 font-mono text-base uppercase text-black transition-opacity hover:opacity-90">
            [REQUEST ACCESS]
          </button>
        </motion.div>
        <motion.p 
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-6 text-xs text-gray-600"
        >
            All sessions encrypted. Unauthorized access logged.
        </motion.p>
      </div>
    </section>
  );
};
