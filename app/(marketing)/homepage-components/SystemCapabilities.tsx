'use client';

import { useState } from 'react';
import { Briefcase, Crown, DollarSign, Wallet, Heart, Users, Baby, Flame, AlertTriangle, MessageCircle, Megaphone, Shield, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const categories: { icon: LucideIcon; name: string; count: number; uses: string[]; moreUses: string[] }[] = [
  { icon: Briefcase, name: 'Career & Work', count: 15, uses: ['Get a raise', 'Land a promotion', 'Win workplace conflict', 'Survive office politics'], moreUses: ['Get your idea approved', 'Make your boss rely on you', 'Neutralize workplace rivals', 'Get credit for your work', 'Be taken seriously when youngest', 'Recover your reputation after a mistake', 'Reverse a rejection'] },
  { icon: Crown, name: 'Leadership', count: 8, uses: ['Get team buy-in', 'Handle underperformers', 'Earn respect as new leader', 'Drive change adoption'], moreUses: ['Make people work hard for you', 'Stop team going around you', 'Get buy-in from non-reporters', 'Make hard decisions and keep trust'] },
  { icon: DollarSign, name: 'Business & Sales', count: 12, uses: ['Close hesitant deals', 'Stop client ghosting', 'Charge higher prices', 'Win negotiations'], moreUses: ['Get investors interested', 'Turn one-time clients to retainers', 'Increase cold outreach reply rate', 'Get overdue invoices paid', 'Win back clients who left'] },
  { icon: Wallet, name: 'Personal Finance', count: 6, uses: ['Negotiate big purchases', 'Get refunds when policy says no', 'Exit contracts cleanly', 'Get exceptions made'], moreUses: ['Get doctors to take you seriously', 'Talk someone out of a bad financial decision'] },
  { icon: Heart, name: 'Dating & Attraction', count: 14, uses: ['Build tension and chemistry', 'Get out of the friend zone', 'Read mixed signals', 'Make them commit'], moreUses: ['Get an ex back', 'Get a date with someone out of your league', 'Become more attractive through behavior', 'Re-ignite attraction long-term', 'Handle a partner pulling away'] },
  { icon: Users, name: 'Relationships', count: 15, uses: ['Set boundaries', 'Repair trust', 'Handle toxic people', 'Defuse conflicts'], moreUses: ['Get a narcissist off your back', 'Make new friends as an adult', 'Handle passive-aggressive people', 'Get someone to forgive you', 'Convince someone to go to therapy'] },
  { icon: Baby, name: 'Parenting', count: 5, uses: ['Get teens to listen', 'Co-parent with difficult ex', 'Enforce boundaries with respect', 'Have hard conversations'], moreUses: ['Stop your child tuning you out'] },
  { icon: Flame, name: 'Personal Power', count: 13, uses: ['Stop people-pleasing', 'Build unshakeable confidence', 'Command a room', 'Overcome imposter syndrome'], moreUses: ['Stay calm under pressure', 'Reinvent how people see you', 'Become a natural leader', 'Stop self-sabotaging', 'Handle rejection without losing confidence'] },
  { icon: AlertTriangle, name: 'High Stakes', count: 7, uses: ['Win custody situations', 'Get second chances', 'Convince someone to get help', 'Handle public failure'], moreUses: ['Talk someone out of a bad decision', 'Get a partner on board with major change', 'Get an exception when the official answer is no'] },
  { icon: MessageCircle, name: 'Texting & Online', count: 5, uses: ['Get more DM replies', 'Recover dead conversations', 'Close over text', 'Improve dating app results'], moreUses: ['Get someone to respond to your message'] },
  { icon: Megaphone, name: 'Influence & Audience', count: 5, uses: ['Build a trusted audience', 'Write content that converts', 'Make your brand stand out', 'Grow social following'], moreUses: ['Write a compelling bio or profile'] },
  { icon: Shield, name: 'Defend & Protect', count: 10, uses: ['Spot manipulation', 'Detect liars', 'Shut down gaslighting', 'Recognize toxic people early'], moreUses: ['Protect from being taken advantage of', 'Know when you are being played in a negotiation', 'Detect fake friendships', 'Set limits with people who ignore them'] },
];

const capabilities = [
  {
    icon: '[>_]',
    title: 'AI Strategic Coach',
    description: 'Describe any situation: a salary negotiation, a difficult breakup conversation, a sales call gone sideways. Get a tactical game plan with word-for-word scripts in under 60 seconds.',
    classified: false,
  },
  {
    icon: '[◉]',
    title: 'Conversation Analysis Engine',
    description: 'Screenshot any text conversation. The AI identifies manipulation tactics, power imbalances, and hidden intentions, then gives you the exact words to shift the dynamic in your favor.',
    classified: true,
  },
  {
    icon: '[◆]',
    title: 'Influence Technique Library',
    description: '700+ techniques drawn from a proprietary knowledge base of psychology, dark psychology, NLP, and influence research. Each one comes with practice scenarios, annotated examples, and AI coaching to help you deploy them naturally. New material added continuously.',
    classified: false,
  },
];

const Stamp = ({ text, color, className }: { text: string; color: string; className?: string }) => (
  <div className={`absolute -rotate-6 scale-110 border-2 ${color} p-1 text-xs font-bold uppercase tracking-wider ${color} opacity-80 ${className}`}>
    {text}
  </div>
);


export const SystemCapabilities = () => {
  return (
    <section className="relative bg-[#EDE3D0] rounded-lg px-6 py-8 md:p-12">
        <div className="text-left mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-black">
            What You Get Access To
          </h2>
          <div className="w-24 h-1 bg-green-600 mt-4"></div>
          <p className="font-mono text-sm uppercase tracking-widest text-gray-600 mt-4">
            Your Complete Strategic Communication Toolkit
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {capabilities.map((capability, index) => (
            <div
              key={capability.title}
              className="relative flex flex-col rounded-sm border border-[#999] bg-[#F4ECD8] p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-black"
            >
              {capability.classified && (
                <Stamp text="ADVANCED" color="border-blue-600 text-blue-600" className="top-4 right-4" />
              )}
              <div className="font-mono text-2xl text-black mb-4">{capability.icon}</div>
              <h3 className="font-special-elite text-xl font-bold text-black">
                {capability.title}
              </h3>
              <p className="mt-2 text-base text-gray-800 leading-relaxed font-special-elite">
                {capability.description}
              </p>
              <div className="flex-grow" />
              <div className="mt-6 flex items-center gap-2 border-t border-dashed border-gray-400 pt-4">
                <div className="h-2.5 w-2.5 rounded-full bg-green-500 border border-green-700"></div>
                <span className="font-mono text-xs uppercase text-green-800 tracking-wider">
                  Status: Available
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Use Cases Section */}
        <PracticalApplications />
    </section>
  );
};

function PracticalApplications() {
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-black mb-2 text-center">PRACTICAL APPLICATIONS</h3>
      <p className="text-center text-gray-600 text-base mb-8 font-mono uppercase tracking-wider">121 use cases across 12 categories</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isExpanded = expandedCat === cat.name;
          return (
            <div
              key={cat.name}
              className="relative bg-[#F4ECD8] border border-[#999] p-5 hover:border-black hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => setExpandedCat(isExpanded ? null : cat.name)}
            >
              <div className="flex items-center gap-3 mb-3">
                <Icon className="h-6 w-6 text-[#5C3A1E] shrink-0" strokeWidth={1.8} />
                <h4 className="font-bold text-black text-base">{cat.name}</h4>
              </div>
              <ul className="text-sm text-gray-700 space-y-1.5">
                {cat.uses.map((u) => (
                  <li key={u} className="flex items-start gap-1.5">
                    <span className="text-green-700 mt-0.5 shrink-0">&#x2713;</span>
                    <span>{u}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-[#D4A017] font-mono mt-3 tracking-wide">+{cat.count - cat.uses.length} more &rarr;</p>

              {/* Expanded popup */}
              {isExpanded && (
                <div className="absolute z-40 left-0 right-0 top-full mt-1 bg-white border-2 border-[#D4A017] rounded-lg shadow-2xl p-5 min-w-[280px]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-[#5C3A1E]" strokeWidth={1.8} />
                      <h5 className="font-bold text-black text-sm">{cat.name}</h5>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setExpandedCat(null); }} className="text-gray-400 hover:text-black">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 font-mono mb-3">ALL {cat.count} USE CASES</p>
                  <ul className="text-sm text-gray-800 space-y-1.5 max-h-[300px] overflow-y-auto">
                    {[...cat.uses, ...cat.moreUses].map((u) => (
                      <li key={u} className="flex items-start gap-1.5">
                        <span className="text-green-700 mt-0.5 shrink-0">&#x2713;</span>
                        <span>{u}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
