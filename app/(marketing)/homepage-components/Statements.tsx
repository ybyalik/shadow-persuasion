'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const Redacted = ({ children }: { children: React.ReactNode }) => <span className="bg-black text-black inline-block px-1">{children}</span>;

interface StatementProps {
  codename: string;
  date: string;
  title: string;
  children: React.ReactNode;
  index: number;
  inView: boolean;
}

const Statement = ({ codename, date, title, children, index, inView }: StatementProps) => (
  <motion.div
    className="border-2 border-gray-400 bg-[#F4ECD8] p-8 relative shadow-md"
    initial={{ opacity: 0, y: 30 }}
    animate={inView ? { opacity: 1, y: 0 } : {}}
    transition={{ duration: 0.5, delay: index * 0.15 }}
  >
    {/* Quotation mark */}
    <span className="text-5xl leading-none text-amber-600/40 font-serif select-none">
      &ldquo;
    </span>

    <h3 className="font-mono text-xs uppercase tracking-widest text-amber-700 font-bold mb-1">
      [{codename}] &mdash; {title}
    </h3>
    <p className="font-mono text-xs text-gray-500 mb-4">STATEMENT TAKEN {date}</p>

    <div className="text-[#1A1A1A] text-base leading-relaxed space-y-4">
      {children}
    </div>

    <div className="mt-6 pt-4 border-t border-gray-300">
      <p className="text-sm text-gray-600">Signature: <span className="font-mono">_______________</span></p>
    </div>

    <div className="absolute bottom-4 right-4 text-red-700 text-sm font-bold border-2 border-red-700 p-1.5 transform -rotate-6 opacity-70 font-mono">
      SWORN AND ATTESTED
    </div>
  </motion.div>
);

const Statements = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });

  return (
    <section ref={ref}>
      <h2 className="font-mono text-sm uppercase tracking-widest text-gray-500 mb-2">
        PERSONNEL FILES
      </h2>
      <p className="text-3xl mt-1 mb-12">Field Operator Testimonials</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Statement codename="VIPER" date="██/██/2026" title="HIGH-TICKET SALES" index={0} inView={inView}>
          <p>&ldquo;I used to see conversations as a two-way street. Shadow Persuasion revealed it&apos;s a chessboard, and I was playing checkers. My close rate in high-ticket sales went from 20% to over 80% in three months. It&apos;s not about what you say, it&apos;s about creating a reality where your outcome is the only logical conclusion. The AI doesn&apos;t just give you lines; it teaches you how to <Redacted>control the frame</Redacted> from the first word.&rdquo;</p>
        </Statement>

        <Statement codename="ECHO" date="██/██/2026" title="STRATEGIC FUNDRAISING" index={1} inView={inView}>
          <p>&ldquo;The Visual Intelligence Module is terrifyingly effective. I uploaded a photo from a fundraising dinner, and the analysis of the board members&apos; body language gave me the leverage I needed to secure a seven-figure donation. It pointed out a <Redacted>micro-expression of contempt</Redacted> between two directors, which I exploited to create a private alliance. This feels like a superpower.&rdquo;</p>
        </Statement>

        <Statement codename="SPECTRE" date="██/██/2026" title="CORPORATE ACQUISITIONS" index={2} inView={inView}>
          <p>&ldquo;I deal with corporate acquisitions. My job is to find the breaking point. Before this, it was intuition and expensive research. Now, it&apos;s a science. The profiling unit gave me a full psychological workup of a target CEO from a few of his public interviews. It identified a deep-seated <Redacted>fear of irrelevance</Redacted>. I structured my entire offer around that, and they accepted a bid 30% lower than their board&apos;s initial asking price. It&apos;s an unfair advantage, and I love it.&rdquo;</p>
        </Statement>
      </div>
    </section>
  );
};

export default Statements;
