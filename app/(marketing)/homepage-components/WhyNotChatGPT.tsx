'use client';

import { BookOpen, Brain, UserCheck, Swords, BarChart3, Mic } from 'lucide-react';

const comparisons = [
  {
    chatgpt: 'Generic advice for any topic',
    shadow: 'Built exclusively for influence, persuasion, and strategic communication',
    icon: Brain,
  },
  {
    chatgpt: 'No knowledge of specialized techniques',
    shadow: 'Trained on a proprietary library of psychology, dark psychology, NLP, and influence research not available to general AI',
    icon: BookOpen,
  },
  {
    chatgpt: 'Forgets you after every conversation',
    shadow: 'Learns your communication style, tracks your relationships, and remembers your history',
    icon: UserCheck,
  },
  {
    chatgpt: 'No way to practice or get feedback',
    shadow: 'AI role-play scenarios with real-time coaching scores and technique annotations',
    icon: Swords,
  },
  {
    chatgpt: 'No structure, no progress tracking',
    shadow: 'XP system, daily missions, Persuasion Score, spaced repetition, and rank progression',
    icon: BarChart3,
  },
  {
    chatgpt: 'Sounds like a robot wrote it',
    shadow: 'Voice Profile adapts every script to sound like YOU, not a template',
    icon: Mic,
  },
];

export default function WhyNotChatGPT() {
  return (
    <section className="bg-[#0D0D0D] py-16 md:py-20 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-mono text-sm uppercase tracking-widest text-gray-500 mb-3">
            THE KNOWLEDGE GAP
          </h2>
          <p className="text-3xl md:text-4xl font-bold text-[#F4ECD8] mb-4">
            &ldquo;Can&apos;t I Just Use ChatGPT?&rdquo;
          </p>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            You could ask a general AI for advice. But that is like bringing a pocket knife to a chess match. Here is why.
          </p>
        </div>

        {/* Knowledge base callout */}
        <div className="bg-[#1A1A1A] border-l-4 border-[#D4A017] rounded-r-xl p-6 md:p-8 mb-10">
          <div className="flex items-start gap-4">
            <div className="shrink-0 mt-0.5 w-12 h-12 rounded-lg bg-[#D4A017]/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-[#D4A017]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#F4ECD8] mb-3">Proprietary Knowledge Base</h3>
              <p className="text-gray-300 leading-relaxed mb-3">
                Powered by a continuously expanding library of research that general-purpose AI has never been trained on:
              </p>
              <ul className="space-y-1.5 text-gray-400">
                <li className="flex items-start gap-2"><span className="text-[#D4A017] mt-0.5">&#9670;</span>Dark psychology, behavioral science &amp; NLP techniques</li>
                <li className="flex items-start gap-2"><span className="text-[#D4A017] mt-0.5">&#9670;</span>Negotiation &amp; influence research from specialized sources</li>
                <li className="flex items-start gap-2"><span className="text-[#D4A017] mt-0.5">&#9670;</span>Counter-strategies and coaching responses from curated experts</li>
              </ul>
              <p className="text-gray-500 text-sm mt-3 italic">Insights no amount of ChatGPT prompting can replicate.</p>
            </div>
          </div>
        </div>

        {/* Comparison grid */}
        <div className="space-y-4">
          {comparisons.map((row, i) => {
            const Icon = row.icon;
            return (
              <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 md:gap-6 items-stretch">
                {/* ChatGPT side */}
                <div className="bg-[#1A1A1A] border border-[#333] rounded-lg p-4 md:p-5 flex items-center gap-3">
                  <span className="text-red-400 text-lg shrink-0">&#x2715;</span>
                  <p className="text-gray-400 text-sm md:text-base">{row.chatgpt}</p>
                </div>

                {/* Center icon */}
                <div className="hidden md:flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-[#D4A017]/10 border border-[#D4A017]/30 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-[#D4A017]" />
                  </div>
                </div>

                {/* Shadow Persuasion side */}
                <div className="bg-[#1A1A1A] border border-[#D4A017]/30 rounded-lg p-4 md:p-5 flex items-center gap-3">
                  <span className="text-green-400 text-lg shrink-0">&#x2713;</span>
                  <p className="text-[#F4ECD8] text-sm md:text-base">{row.shadow}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Column labels */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 md:gap-6 mt-4">
          <p className="text-center text-xs font-mono uppercase tracking-wider text-gray-500">ChatGPT / General AI</p>
          <div className="hidden md:block w-10" />
          <p className="text-center text-xs font-mono uppercase tracking-wider text-[#D4A017]">Shadow Persuasion</p>
        </div>

        {/* Bottom line */}
        <div className="text-center mt-10">
          <p className="text-gray-400 text-base">
            ChatGPT is a generalist. Shadow Persuasion is a specialist, powered by research most AI has never seen.
          </p>
        </div>
      </div>
    </section>
  );
}
