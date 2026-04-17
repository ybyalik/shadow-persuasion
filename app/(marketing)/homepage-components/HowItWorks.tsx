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
    <section className="py-16 md:py-20 px-6 md:px-12 bg-[#1A1A1A]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl lg:text-4xl font-bold text-center mb-3 text-[#F4ECD8]">
          How It Works
        </h2>
        <p className="text-center text-gray-400 mb-14 text-lg max-w-2xl mx-auto">
          Three steps to becoming the most strategic communicator in any room
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step) => {
            const StepIcon = step.icon;
            return (
              <div
                key={step.number}
                className="relative bg-[#222] border border-[#333] rounded-xl p-6 lg:p-8 hover:border-[#D4A017]/50 transition-all duration-300"
              >
                {/* Step number */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-lg bg-[#D4A017]/10 border border-[#D4A017]/30 flex items-center justify-center">
                    <StepIcon className="h-6 w-6 text-[#D4A017]" />
                  </div>
                  <span className="text-sm font-mono text-[#D4A017] tracking-widest font-bold">STEP {step.number}</span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-[#F4ECD8] mb-3">{step.title}</h3>

                {/* Description */}
                <p className="text-gray-400 text-base leading-relaxed mb-6">{step.description}</p>

                {/* Detail bullets */}
                <ul className="space-y-3">
                  {step.details.map((detail) => {
                    const DetailIcon = detail.icon;
                    return (
                      <li key={detail.text} className="flex items-start gap-3">
                        <DetailIcon className="h-4 w-4 text-[#D4A017] mt-0.5 shrink-0" strokeWidth={2} />
                        <span className="text-sm text-gray-300">{detail.text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Connecting flow arrows — desktop only */}
        <div className="hidden md:flex justify-center items-center gap-4 mt-10 text-gray-600">
          <span className="text-sm font-mono">Upload</span>
          <span className="text-[#D4A017]">&#8594;</span>
          <span className="text-sm font-mono">Strategy</span>
          <span className="text-[#D4A017]">&#8594;</span>
          <span className="text-sm font-mono">Results</span>
        </div>
      </div>
    </section>
  );
}
