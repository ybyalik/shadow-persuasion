'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Upload, Zap, TrendingUp, Camera, MessageSquare, FileText, Target, Shield, CheckCircle, ChevronDown } from 'lucide-react';

/* ────────────────────────────────────────────
   Data
   ──────────────────────────────────────────── */

const SAMPLE_INPUT = "I've been thinking about it, and I just don't think the timing is right for a raise. You know how much I value you. Let's revisit this after Q3 when things settle down.";

const sampleResult = {
  threatScore: 6,
  tactics: [
    { tactic: 'Future Faking', category: 'Misdirection', quote: "let's revisit this after Q3", explanation: 'Pushes commitment to a vague future date with no guarantee. Creates the illusion of agreement while avoiding action.', counterResponse: "I appreciate the timeline. Can we set a specific date and define what metrics would make this a yes?" },
    { tactic: 'Flattery Shield', category: 'Flattery', quote: "You know how much I value you", explanation: 'Emotional cushioning before a rejection. Makes you feel guilty for pushing back after being praised.', counterResponse: "Thank you, and because that value is mutual, I want to make sure my compensation reflects it. What would need to change?" },
  ],
  responseOptions: [
    { type: 'Direct & Assertive', message: "I hear you on timing. I've done some research and my market rate is $X-Y. I'm not looking to leave, but I need us to close that gap. What would make this a yes before Q3?", riskLevel: 'MEDIUM' },
    { type: 'Strategic Patience', message: "I understand. Let's put a specific date on the calendar, say June 15th, and agree on the metrics you'd need to see. That way we're both clear on the path forward.", riskLevel: 'LOW' },
  ],
};

/* ────────────────────────────────────────────
   FAQ Accordion
   ──────────────────────────────────────────── */

function AccordionItem({ question, children }: { question: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#D4A017]/20">
      <button className="w-full flex justify-between items-center text-left py-5 px-4 group" onClick={() => setOpen(!open)}>
        <span className="text-lg font-bold text-[#1a1207] group-hover:text-[#D4A017] transition-colors">{question}</span>
        <ChevronDown className={`w-5 h-5 text-[#D4A017] shrink-0 ml-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-4 pb-5 text-base leading-relaxed text-[#3a3024]">{children}</div>}
    </div>
  );
}

/* ────────────────────────────────────────────
   Page
   ──────────────────────────────────────────── */

export default function SalaryNegotiationLP() {
  const [activeTab, setActiveTab] = useState<'overview' | 'tactics' | 'responses'>('overview');

  return (
    <main className="bg-[#F4ECD8] text-[#1A1A1A]">

      {/* ── HERO ── */}
      <section className="relative bg-[#0D0D0D] text-[#F4ECD8] px-6 md:px-12 py-20 md:py-28">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-mono text-sm uppercase tracking-widest text-[#D4A017] mb-4">Salary Negotiation System</p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Stop Leaving <span className="text-[#D4A017]">$5,000 to $50,000+</span> on the Table Every Year
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            Your boss has scripts, HR training, and budget authority. You walk in with nothing but hope. Shadow Persuasion gives you the exact words, tactics, and counter-strategies to close the gap.
          </p>
          <a href="/login" className="inline-block bg-[#D4A017] text-[#0A0A0A] font-mono uppercase font-bold px-10 py-4 rounded-lg hover:bg-[#E8B830] transition-colors tracking-wider text-lg">
            Get Your Negotiation Strategy
          </a>
          <p className="text-sm text-gray-500 mt-4">$99/month. Cancel anytime. 30-day money-back guarantee.</p>
        </div>
      </section>

      {/* ── PAIN / AGITATION ── */}
      <section className="max-w-3xl mx-auto px-6 md:px-12 py-14">
        <h2 className="text-3xl font-bold mb-8 text-center">Sound Familiar?</h2>
        <div className="space-y-4">
          {[
            "You know you're underpaid but don't know how to bring it up without sounding greedy or ungrateful.",
            "You asked for a raise and got \"we'll revisit it later.\" Later never came.",
            "You watch less experienced coworkers earn more because they negotiated on the way in. You didn't.",
            "You rehearsed what to say, but in the moment your boss threw a curveball and you folded.",
            "You Googled \"how to negotiate a raise\" and got vague advice like \"know your worth.\" You need exact words.",
          ].map((pain, i) => (
            <div key={i} className="flex items-start gap-3 bg-[#EDE3D0] border border-[#C4B89A] rounded-lg p-4">
              <span className="text-red-600 mt-0.5 shrink-0 text-lg">&#10005;</span>
              <p className="text-base text-[#3B2E1A] leading-relaxed">{pain}</p>
            </div>
          ))}
        </div>
        <p className="text-center mt-8 text-lg text-[#5C3A1E] font-bold">
          Every month you wait, you lose money you already earned but never collected.
        </p>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-[#EDE3D0] px-6 md:px-12 py-14">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">How It Works</h2>
          <p className="text-center text-[#5C4B32] mb-12 text-lg">From underpaid to counter-offer in under 60 seconds</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Upload, num: '01', title: 'SHOW US THE CONVERSATION', desc: "Screenshot your boss's response, paste the email, or describe the situation. The AI instantly understands the context.", details: [{ icon: Camera, text: 'Screenshot their rejection text or email' }, { icon: MessageSquare, text: 'Describe the situation in your own words' }, { icon: FileText, text: 'Paste the exact message you received' }] },
              { icon: Zap, num: '02', title: 'GET YOUR COUNTER-STRATEGY', desc: 'The AI identifies what tactics your boss is using, maps the power dynamics, and gives you word-for-word scripts to shift the conversation in your favor.', details: [{ icon: Target, text: 'Detect delay tactics, deflection, and guilt tripping' }, { icon: MessageSquare, text: 'Multiple response options with risk levels' }, { icon: Shield, text: 'Scripts adapted to your voice and situation' }] },
              { icon: TrendingUp, num: '03', title: 'WALK IN AND WIN', desc: 'Practice the conversation with AI role-play before the real meeting. Walk in prepared with the exact framing, timing, and words to close.', details: [{ icon: Target, text: 'AI role-play: practice with a simulated boss' }, { icon: MessageSquare, text: 'Real-time coaching on your delivery' }, { icon: TrendingUp, text: 'Track your negotiation confidence score' }] },
            ].map((step) => {
              const StepIcon = step.icon;
              return (
                <div key={step.num} className="bg-white border border-gray-300 rounded-xl p-6 hover:shadow-lg hover:border-[#D4A017] transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-[#D4A017]/10 border border-[#D4A017]/30 flex items-center justify-center">
                      <StepIcon className="h-6 w-6 text-[#D4A017]" />
                    </div>
                    <span className="text-sm font-mono text-[#D4A017] tracking-widest font-bold">STEP {step.num}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">{step.title}</h3>
                  <p className="text-[#3B2E1A] text-base leading-relaxed mb-4">{step.desc}</p>
                  <ul className="space-y-2">
                    {step.details.map((d) => {
                      const DIcon = d.icon;
                      return (
                        <li key={d.text} className="flex items-start gap-2">
                          <DIcon className="h-4 w-4 text-[#D4A017] mt-0.5 shrink-0" strokeWidth={2} />
                          <span className="text-sm text-gray-600">{d.text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BEFORE / AFTER ── */}
      <section className="bg-[#1A1A1A] text-[#E8E8E0] px-6 md:px-12 py-14">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-sm uppercase tracking-widest text-amber-500/70 text-center mb-2">The Difference</p>
          <h2 className="text-3xl font-bold text-white text-center mb-10">What You Say vs. What You Should Say</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
            <div className="border-2 border-red-800/60 bg-[#222] p-6 rounded-lg">
              <div className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-red-700 via-red-500 to-red-700 rounded-t-lg" />
              <h3 className="font-mono text-sm uppercase tracking-widest text-red-400 mb-1">Without Shadow Persuasion</h3>
              <p className="text-xs text-red-400/50 font-mono mb-4">What most people say</p>
              <p className="text-lg text-gray-400 italic leading-relaxed">&ldquo;I understand the budget is tight. Can we revisit this in six months? I&apos;m committed to proving my value and hopefully we can make it work then.&rdquo;</p>
              <p className="text-xs text-red-400/60 mt-4 font-mono">Result: You wait 6 months. Nothing changes. You&apos;re still underpaid.</p>
            </div>
            <div className="border-2 border-green-600/50 bg-[#222] p-6 rounded-lg">
              <div className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-green-700 via-green-500 to-green-700 rounded-t-lg" />
              <h3 className="font-mono text-sm uppercase tracking-widest text-green-400 mb-1">With Shadow Persuasion</h3>
              <p className="text-xs text-green-400/50 font-mono mb-4">AI-generated counter-strategy</p>
              <p className="text-lg text-gray-200 leading-relaxed">&ldquo;I appreciate the transparency. Based on my research, the market rate for this role with my track record is $95-110K. I&apos;m not looking to leave, but I need my compensation to reflect the value I&apos;m delivering. What would need to happen for us to close that gap this quarter?&rdquo;</p>
              <p className="text-xs text-green-400/60 mt-4 font-mono">Result: Specific timeline. Measurable criteria. Ball in their court.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SAMPLE ANALYSIS (Tabbed, Beige) ── */}
      <section className="bg-[#EDE3D0] w-full px-6 md:px-12 py-14">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-sm uppercase tracking-widest text-[#8A7A5A] text-center mb-2">Real Output From Our System</p>
          <h2 className="text-3xl font-bold text-center mb-8">Here&apos;s What the AI Reveals in Your Boss&apos;s Response</h2>

          <div className="bg-[#F4ECD8] border border-[#C4B89A] rounded-xl p-5 mb-6">
            <p className="font-mono text-xs text-[#8A7A5A] uppercase tracking-wider mb-2">Your Boss Said:</p>
            <p className="text-[#3B2E1A] text-base italic leading-relaxed">&ldquo;{SAMPLE_INPUT}&rdquo;</p>
          </div>

          <div className="flex gap-1 mb-1 bg-[#F4ECD8] p-1 rounded-t-xl border border-b-0 border-[#C4B89A]">
            {(['overview', 'tactics', 'responses'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 px-4 text-sm font-mono uppercase tracking-wider rounded-lg transition-all ${activeTab === tab ? 'bg-[#D4A017] text-[#0A0A0A] font-bold' : 'text-[#6B5B3E] hover:text-[#1A1A1A] hover:bg-[#EDE3D0]'}`}>
                {tab === 'overview' ? 'Overview' : tab === 'tactics' ? 'Tactics Detected' : 'What To Say Back'}
              </button>
            ))}
          </div>

          <div className="bg-[#F4ECD8] border border-[#C4B89A] rounded-b-xl p-6 md:p-8 min-h-[280px]">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-[#EDE3D0] rounded-xl p-5 border border-yellow-600/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-sm uppercase tracking-wider text-[#4A3C28] font-bold">Manipulation Threat Level</span>
                    <span className="font-mono text-3xl font-bold text-[#1A1A1A]">{sampleResult.threatScore}/10</span>
                  </div>
                  <div className="w-full h-3 bg-[#D4C9AE] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-yellow-500" style={{ width: '60%' }} />
                  </div>
                  <p className="text-sm mt-2 font-mono text-[#5C3A1E]">{sampleResult.tactics.length} delay/deflection tactics detected</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#EDE3D0] rounded-xl p-4 border border-[#C4B89A] text-center">
                    <p className="text-2xl font-bold text-[#D4A017]">4/10</p>
                    <p className="text-xs font-mono text-[#6B5B3E] mt-1">Your Current Power</p>
                  </div>
                  <div className="bg-[#EDE3D0] rounded-xl p-4 border border-[#C4B89A] text-center">
                    <p className="text-2xl font-bold text-[#2563EB]">8/10</p>
                    <p className="text-xs font-mono text-[#6B5B3E] mt-1">Their Current Power</p>
                  </div>
                  <div className="bg-[#EDE3D0] rounded-xl p-4 border border-[#C4B89A] text-center">
                    <p className="text-2xl font-bold text-green-700">72%</p>
                    <p className="text-xs font-mono text-[#6B5B3E] mt-1">Success Probability</p>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'tactics' && (
              <div className="space-y-4">
                <p className="text-sm text-[#6B5B3E] font-mono">{sampleResult.tactics.length} manipulation tactics your boss used in this response</p>
                {sampleResult.tactics.map((t, i) => (
                  <div key={i} className="bg-[#EDE3D0] rounded-xl p-5 border border-red-600/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold text-[#1A1A1A]">{t.tactic}</h4>
                      <span className="text-xs font-mono px-3 py-1 rounded-full bg-red-100 text-red-700 border border-red-300">{t.category}</span>
                    </div>
                    <blockquote className="border-l-3 border-[#D4A017] pl-4 py-2 bg-[#F4ECD8] rounded-r-lg">
                      <p className="text-base text-[#4A3C28] italic">&ldquo;{t.quote}&rdquo;</p>
                    </blockquote>
                    <p className="text-sm text-[#4A3C28] leading-relaxed">{t.explanation}</p>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'responses' && (
              <div className="space-y-4">
                <p className="text-sm text-[#6B5B3E] font-mono">AI-generated counter-strategies for your next conversation</p>
                {sampleResult.tactics.map((t, i) => (
                  <div key={i} className="bg-green-50 border border-green-300 rounded-xl p-5">
                    <p className="font-mono text-xs uppercase text-green-700 font-bold mb-1">Counter to: {t.tactic}</p>
                    <p className="text-base text-green-900 leading-relaxed">&ldquo;{t.counterResponse}&rdquo;</p>
                  </div>
                ))}
                <div className="border-t border-[#C4B89A] pt-4 mt-4">
                  <p className="font-mono text-xs uppercase text-[#6B5B3E] mb-3">Full Response Options</p>
                  {sampleResult.responseOptions.map((opt, i) => (
                    <div key={i} className="bg-[#EDE3D0] border border-[#C4B89A] rounded-xl p-5 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-[#1A1A1A]">{opt.type}</h4>
                        <span className={`text-xs font-mono px-2 py-1 rounded-full border ${opt.riskLevel === 'LOW' ? 'text-green-700 bg-green-50 border-green-300' : 'text-yellow-700 bg-yellow-50 border-yellow-300'}`}>{opt.riskLevel} RISK</span>
                      </div>
                      <p className="text-base text-[#3B2E1A] italic leading-relaxed">&ldquo;{opt.message}&rdquo;</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── MID CTA ── */}
      <div className="flex justify-center px-6 py-12 bg-[#F4ECD8]">
        <div className="max-w-2xl w-full bg-[#1A1A1A] rounded-2xl px-8 py-10 md:px-12 md:py-14 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#F4ECD8] mb-2">Your Next Raise Is One Conversation Away</h2>
          <p className="text-gray-400 mb-6">Get the exact words before your next meeting.</p>
          <div className="mb-2">
            <span className="text-4xl font-bold text-[#D4A017]">$99</span>
            <span className="text-lg text-[#F4ECD8]/70">/month</span>
          </div>
          <p className="text-sm text-[#F4ECD8]/50 mb-6">Cancel anytime</p>
          <a href="/login" className="inline-block bg-[#D4A017] hover:bg-[#C49A3A] text-[#1A1A1A] font-bold text-lg px-10 py-4 rounded-lg tracking-wide transition-colors">GET YOUR COUNTER-STRATEGY</a>
          <p className="mt-4 text-sm text-[#F4ECD8]/40">One raise pays for a year of membership</p>
        </div>
      </div>

      {/* ── WHAT YOU GET ── */}
      <section className="bg-[#EDE3D0] px-6 md:px-12 py-14">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Everything You Need to Negotiate With Confidence</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Conversation Analyzer', desc: 'Upload your boss\'s response. See what tactics they\'re using and get counter-scripts instantly.' },
              { title: 'AI Strategic Coach', desc: 'Describe your situation and get a complete negotiation game plan with word-for-word scripts.' },
              { title: 'Training Arena', desc: 'Practice the salary conversation with AI role-play before the real meeting. Get scored on your delivery.' },
              { title: 'Message Optimizer', desc: 'Paste your draft email asking for a raise. Get psychologically optimized rewrites.' },
              { title: 'Technique Library', desc: '700+ influence techniques including anchoring, frame control, strategic silence, and more.' },
              { title: 'Voice Profile', desc: 'The AI adapts all scripts to sound like you. You\'ll sound sharp, not scripted.' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 bg-[#F4ECD8] border border-[#C4B89A] rounded-lg p-4">
                <CheckCircle className="h-5 w-5 text-green-700 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-[#1A1A1A] text-sm">{item.title}</h4>
                  <p className="text-sm text-[#5C4B32] mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="max-w-5xl mx-auto px-6 md:px-12 py-14">
        <h2 className="text-3xl font-bold text-center mb-8">Members Who Negotiated and Won</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { name: 'SARAH K.', title: 'Tech Executive', quote: "I was getting passed over for promotion despite outperforming my peers. The Conversation Analyzer showed me that my boss was using delay tactics every time I brought up advancement. The AI gave me a specific framework to reframe the conversation, and I got promoted within 6 weeks." },
            { name: 'MARK T.', title: 'Software Engineer', quote: "I used the exact script Shadow Persuasion gave me and got a $28K raise. My boss literally said \"I didn't realize the gap was that significant.\" The anchoring technique changed everything. I only wish I had found this before my last two annual reviews." },
          ].map((t, i) => (
            <div key={i} className="bg-[#EDE3D0] border-2 border-gray-400 p-6 relative">
              <span className="text-5xl leading-none text-amber-600/40 font-serif select-none">&ldquo;</span>
              <h3 className="font-mono text-xs uppercase tracking-widest text-amber-700 font-bold mb-1">[{t.name}], {t.title}</h3>
              <p className="text-base text-[#1A1A1A] leading-relaxed mt-3">&ldquo;{t.quote}&rdquo;</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── GUARANTEE ── */}
      <div className="flex justify-center px-6 py-12">
        <div className="max-w-2xl w-full bg-[#EDE3D0] border-2 border-[#D4A017] rounded-2xl px-8 py-10 text-center">
          <div className="text-5xl mb-4">&#x1f6e1;&#xfe0f;</div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">30-Day Money-Back Guarantee</h2>
          <p className="text-base text-[#1A1A1A]/80 leading-relaxed mb-4">
            Use Shadow Persuasion for your next salary conversation. If you don&apos;t feel significantly more prepared and confident, email us within 30 days for a full refund. No questions asked.
          </p>
          <p className="text-sm text-[#1A1A1A]/60">No contracts. No cancellation fees. Cancel anytime.</p>
        </div>
      </div>

      {/* ── FAQ ── */}
      <section className="bg-[#F4ECD8] py-14 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Salary Negotiation FAQ</h2>
          <div className="bg-[#efe5cc] border border-[#D4A017]/30 rounded-lg overflow-hidden">
            <AccordionItem question="What if my boss already said no?">
              <p>That is actually the ideal time to use Shadow Persuasion. Upload exactly what they said and the AI will identify what tactics they used and give you a counter-strategy. Most &quot;no&quot; responses are actually delay tactics that can be reframed.</p>
            </AccordionItem>
            <AccordionItem question="What if I don't know my market rate?">
              <p>The AI Strategic Coach will help you research and frame your market rate as part of your negotiation strategy. It is not just about knowing the number. It is about how you anchor and present it.</p>
            </AccordionItem>
            <AccordionItem question="Can I practice the conversation before the real meeting?">
              <p>Yes. The Training Arena lets you role-play a salary negotiation with an AI that plays your boss. It responds realistically, pushes back, and uses common manager objections. You get real-time coaching scores after each response.</p>
            </AccordionItem>
            <AccordionItem question="How is this different from salary negotiation articles online?">
              <p>Articles give generic advice. Shadow Persuasion analyzes YOUR specific situation. You upload what your boss actually said, and the AI gives you word-for-word responses tailored to their exact tactics. Plus a 700+ technique library and AI coaching you can use 24/7.</p>
            </AccordionItem>
            <AccordionItem question="Is $99/month worth it for a salary negotiation?">
              <p>Members report salary increases of $5,000 to $50,000+. A single successful negotiation pays for years of membership. And the system is not just for salary. You get access to all 121 use cases across career, business, relationships, and more.</p>
            </AccordionItem>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-[#0D0D0D] text-[#F4ECD8] px-6 md:px-12 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Boss Has a Script. Now You Have One Too.</h2>
          <p className="text-gray-400 text-lg mb-8">Stop winging the most important financial conversation of your year.</p>
          <a href="/login" className="inline-block bg-[#D4A017] hover:bg-[#E8B830] text-[#0A0A0A] font-mono uppercase font-bold px-10 py-4 rounded-lg tracking-wider text-lg transition-colors">
            Get Your Negotiation Strategy
          </a>
          <p className="text-sm text-gray-500 mt-4">$99/month. Cancel anytime. 30-day money-back guarantee.</p>
          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-gray-500 font-mono">
            <span>🔒 256-bit encryption</span>
            <span>🗑️ Delete your data anytime</span>
            <span>🚫 Never shared or sold</span>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0D0D0D] border-t border-white/10 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-4">
          <img src="/logo-dark.png" alt="Shadow Persuasion" className="w-28" />
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy</Link>
            <Link href="/" className="hover:text-gray-300 transition-colors">Home</Link>
          </div>
          <p className="text-xs text-gray-600 text-center">Copyright &copy; {new Date().getFullYear()} Shadow Persuasion. All Rights Reserved.</p>
        </div>
      </footer>
    </main>
  );
}
