'use client';

import { motion } from 'framer-motion';

export default function Opening() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, delay: 0.5 }}
      className="flex min-h-screen w-full items-center justify-center relative"
    >
      <h1 className="text-5xl font-light tracking-wider text-center">
        You already know why you're here.
      </h1>
      
      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 3 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-gray-400"
      >
        <span className="text-sm font-light mb-2">scroll</span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 3l7 7h-4v7H7v-7H3l7-7z" transform="rotate(180 10 10)"/>
          </svg>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
