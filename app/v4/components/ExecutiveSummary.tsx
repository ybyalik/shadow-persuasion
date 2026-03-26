'use client';

const Redacted = ({ children }) => (
  <span className="bg-black text-black inline-block px-1 transition-opacity duration-150 hover:opacity-80 cursor-pointer">{children}</span>
);

const Highlight = ({ children }) => (
  <span style={{ background: 'rgba(255, 241, 118, 0.3)' }}>{children}</span>
);

const ExecutiveSummary = () => {
  return (
    <section>
      <div className="border-b-2 border-t-2 border-black py-1 mb-12 text-sm text-center">
        <p>PAGE 1 of 12 | CLASSIFICATION: DECLASSIFIED | DATE: MARCH 2026</p>
      </div>
      <div className="relative">
        <h2 className="text-4xl font-bold uppercase tracking-wider mb-8 text-center">Executive Summary</h2>
        <div className="space-y-6 text-lg leading-relaxed">
          <p>
            Project SHADOW PERSUASION is an initiative to weaponize recent breakthroughs in artificial intelligence for the purpose of psychological influence. This document outlines a system that provides operators with a decisive edge in any human interaction. It is not a theoretical framework, but a live, operational toolkit designed to <Highlight>dismantle resistance and shape belief</Highlight> at scale.
          </p>
          <p>
            The core of the system is the AI Operator Console, a conversational interface that provides real-time tactical guidance. Operators can input scenarios, <Redacted>upload conversation screenshots</Redacted>, or analyze body language from images to receive actionable persuasion strategies. The system leverages a proprietary model, the Dark Psychology Engine, trained on a restricted dataset of interrogation transcripts, <Redacted>hypnotherapy sessions</Redacted>, and high-stakes negotiation recordings.
          </p>
          <p>
            The objective is to provide a comprehensive, asymmetric advantage in all negotiations, social engineering engagements, and strategic communications. Initial field tests show a <Highlight>412% increase in desired outcomes</Highlight> compared to traditional methods. The system is designed for rapid iteration, with operator feedback continuously improving the core engine's effectiveness. Access is provided on a need-to-know basis to qualified personnel only.
          </p>
        </div>
        <div className="absolute top-1/4 -right-24 text-blue-700 italic transform -rotate-6">
          <p className="text-lg">Note: effectiveness exceeds</p>
          <p className="text-lg">projections — recommend</p>
          <p className="text-lg">wider deployment.</p>
        </div>
      </div>
    </section>
  );
};

export default ExecutiveSummary;
