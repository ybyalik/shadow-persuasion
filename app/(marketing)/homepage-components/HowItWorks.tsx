'use client';
import { Upload, Zap, TrendingUp, Camera, MessageSquare, FileText, Target, Swords, BarChart3 } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Upload,
    title: 'UPLOAD OR DESCRIBE YOUR SITUATION',
    description: 'Screenshot a text conversation, paste an email, or just describe what you are dealing with in plain English. The AI understands any context.',
    details: [
      { icon: Camera, text: 'Screenshot any text or email conversation' },
      { icon: MessageSquare, text: 'Describe a situation in your own words' },
      { icon: FileText, text: 'Paste a message you need to respond to' },
    ],
    accent: '#D4A017',
  },
  {
    number: '02',
    icon: Zap,
    title: 'GET YOUR PERSONALIZED STRATEGY',
    description: 'In under 60 seconds, the AI decodes what is really happening, identifies manipulation tactics, maps power dynamics, and gives you word-for-word scripts to respond.',
    details: [
      { icon: Target, text: 'Power dynamics and manipulation detection' },
      { icon: MessageSquare, text: 'Multiple response options with risk levels' },
      { icon: FileText, text: 'Word-for-word scripts adapted to your voice' },
    ],
    accent: '#D4A017',
  },
  {
    number: '03',
    icon: TrendingUp,
    title: 'PRACTICE, DEPLOY, AND LEVEL UP',
    description: 'Use the scripts in your real conversations. Practice tough scenarios with AI role-play first. Track your progress, earn XP, and watch your Persuasion Score climb.',
    details: [
      { icon: Swords, text: 'AI role-play to rehearse before the real thing' },
      { icon: Target, text: 'Daily missions to practice in real life' },
      { icon: BarChart3, text: 'Track your progress with XP and rankings' },
    ],
    accent: '#D4A017',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 md:py-20 px-6 md:px-12 bg-[#EDE3D0]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl lg:text-4xl font-bold text-center mb-3 text-[#1A1A1A]">
          How It Works
        </h2>
        <p className="text-center text-[#5C4B32] mb-14 text-lg max-w-2xl mx-auto">
          Three steps to becoming the most strategic communicator in any room
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step) => {
            const StepIcon = step.icon;
            return (
              <div
                key={step.number}
                className="relative bg-white border border-gray-300 rounded-xl p-6 lg:p-8 hover:shadow-lg hover:border-[#D4A017] transition-all duration-300"
              >
                {/* Step number */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-lg bg-[#D4A017]/10 border border-[#D4A017]/30 flex items-center justify-center">
                    <StepIcon className="h-6 w-6 text-[#D4A017]" />
                  </div>
                  <span className="text-sm font-mono text-[#D4A017] tracking-widest font-bold">STEP {step.number}</span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">{step.title}</h3>

                {/* Description */}
                <p className="text-[#3B2E1A] text-base leading-relaxed mb-6">{step.description}</p>

                {/* Detail bullets */}
                <ul className="space-y-3">
                  {step.details.map((detail) => {
                    const DetailIcon = detail.icon;
                    return (
                      <li key={detail.text} className="flex items-start gap-3">
                        <DetailIcon className="h-4 w-4 text-[#D4A017] mt-0.5 shrink-0" strokeWidth={2} />
                        <span className="text-sm text-gray-600">{detail.text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Connecting flow — desktop only */}
        <div className="hidden md:flex justify-center items-center gap-0 mt-12">
          {['Upload', 'Strategy', 'Results'].map((label, i) => (
            <div key={label} className="flex items-center">
              {i > 0 && <div className="w-16 h-0.5 bg-[#D4A017]" />}
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#D4A017] flex items-center justify-center text-white font-bold text-sm">{i + 1}</div>
                <span className="text-sm font-mono text-[#5C4B32] uppercase tracking-wider">{label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
