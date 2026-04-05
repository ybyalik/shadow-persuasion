'use client';

import { Special_Elite } from 'next/font/google';
import { ArrowRight, CheckCircle, DollarSign, TrendingUp, Users, Zap, Star, Shield } from 'lucide-react';

const specialElite = Special_Elite({ subsets: ['latin'], weight: '400' });

export default function CareerSalesPage() {
  return (
    <main className={`${specialElite.className} bg-[#F4ECD8] text-[#1A1A1A] min-h-screen`}>
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center p-8 overflow-hidden">
        {/* Classification Stamps */}
        <div className="absolute top-8 right-8 z-10">
          <p className="text-red-700 text-2xl md:text-3xl font-bold border-4 border-red-700 p-2 transform -rotate-12 opacity-60 origin-center scale-110">CLASSIFIED</p>
          <p className="text-green-700 text-2xl md:text-3xl font-bold border-4 border-green-700 p-2 transform rotate-12 origin-center absolute top-4 -left-4 scale-125">DECLASSIFIED</p>
        </div>

        <div className="z-0 max-w-6xl mx-auto">
          <p className="text-sm uppercase tracking-widest mb-4">DOCUMENT ID: EXEC-PSY-2026-001 // EXECUTIVE AUTHORIZATION</p>
          <p className="text-lg mb-6 text-gray-700">SUBJECT: Corporate Influence Psychology Protocol</p>
          
          <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight">
            DECLASSIFIED: The Executive Psychology Manual That Turned Average Employees Into Six-Figure Earners
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-800 mb-8 max-w-4xl mx-auto">
            Former Corporate Negotiators & Executive Coaches Reveal The Same Strategic Influence Techniques Used To Win Promotions, Negotiate Higher Salaries, And Close Million-Dollar Deals...
          </p>

          <div className="bg-red-100 border-2 border-red-600 p-4 mb-8 max-w-2xl mx-auto">
            <p className="text-red-800 font-bold">WARNING: This material was previously restricted to C-suite executives, senior negotiators, and corporate psychology consultants.</p>
          </div>

          <button className="bg-[#1A1A1A] text-[#F4ECD8] py-4 px-8 text-lg font-bold flex items-center justify-center mx-auto hover:bg-gray-800 transition-colors duration-300">
            REQUEST EXECUTIVE CLEARANCE <ArrowRight className="ml-2" />
          </button>
        </div>
      </section>

      {/* Section Divider */}
      <div className="bg-[#1A1A1A] text-[#F4ECD8] py-4">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-2xl font-bold tracking-widest">// EXECUTIVE INTELLIGENCE ASSESSMENT - CONFIDENTIAL //</p>
        </div>
      </div>

      {/* Problem Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="bg-[#E8DCC0] border-2 border-red-600 p-8 mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-red-600 text-white p-3 rounded-full">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-red-800">CURRENT THREAT LEVEL: Critical Career Stagnation Detected</h2>
                <p className="text-red-700">FIELD REPORT: 73% of qualified professionals are stuck in positions below their capabilities.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">You're good at your job. Maybe even great at it.</h3>
              <p className="text-xl mb-6">You deliver results, meet deadlines, and exceed expectations.</p>
              
              <div className="space-y-4 mb-8">
                <p className="text-lg font-semibold text-red-800">So why is your paycheck the same as it was two years ago?</p>
                <p className="text-lg font-semibold text-red-800">Why did that promotion go to someone less qualified?</p>
                <p className="text-lg font-semibold text-red-800">Why do others seem to effortlessly climb the corporate ladder while you're still waiting for "recognition"?</p>
              </div>
            </div>

            <div className="bg-[#1A1A1A] text-[#F4ECD8] p-8">
              <h4 className="text-xl font-bold mb-4 text-yellow-400">THE BRUTAL TRUTH:</h4>
              <p className="text-lg mb-6">Your technical skills got you in the door. But influence psychology determines who gets promoted, who gets the big raises, and who closes the major deals.</p>
              
              <ul className="space-y-3 text-sm">
                <li>• That colleague who got promoted over you? They didn't work harder - they understood executive psychology.</li>
                <li>• The sales rep making $300K while you make $60K? Same product, different persuasion techniques.</li>
                <li>• That manager who gets "yes" from everyone? They're using influence patterns you were never taught.</li>
                <li>• The negotiator closing million-dollar deals? It's not magic - it's strategic communication psychology.</li>
              </ul>
            </div>
          </div>

          <div className="mt-16 text-center">
            <div className="bg-yellow-100 border-2 border-yellow-600 p-6 max-w-4xl mx-auto">
              <p className="text-2xl font-bold text-yellow-800 mb-4">REALITY CHECK:</p>
              <p className="text-lg text-yellow-900">Every boardroom conversation, every salary negotiation, every client meeting - psychology is determining the outcome.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="bg-[#E8DCC0] py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6 md:px-12 text-center">
          <div className="mb-12">
            <p className="text-sm uppercase tracking-widest mb-2">CLASSIFIED ASSET DESIGNATION</p>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">SHADOW PERSUASION</h2>
            <p className="text-xl text-gray-700 mb-2">Corporate Edition</p>
            <p className="text-lg text-gray-600">Executive-Level Influence Psychology Training System</p>
          </div>

          <div className="bg-[#1A1A1A] text-[#F4ECD8] p-8 mb-12">
            <h3 className="text-2xl font-bold mb-6 text-yellow-400">This is the missing piece of your career puzzle.</h3>
            <p className="text-lg mb-6">You already have the skills. You already do great work. Now you need the influence psychology that turns great work into great compensation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Navigate salary negotiations like a seasoned executive",
              "Present ideas so compellingly that bosses can't say no", 
              "Build the kind of professional rapport that opens doors",
              "Close deals using psychology, not pressure",
              "Command respect in any room, regardless of your title",
              "Recognize when others are using influence techniques on you"
            ].map((benefit, index) => (
              <div key={index} className="bg-[#F4ECD8] border-2 border-green-600 p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-semibold">{benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">EXECUTIVE TACTICAL CAPABILITIES</h2>
            <p className="text-xl text-gray-700">Five classified modules for career advancement</p>
          </div>

          <div className="space-y-12">
            {/* Module A */}
            <div className="bg-[#E8DCC0] border-2 border-[#1A1A1A] p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-[#1A1A1A] text-[#F4ECD8] p-3 rounded">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">MODULE A: Executive Communication Analysis</h3>
                      <p className="text-sm text-gray-600">CLASSIFICATION: Corporate Psychology Intelligence</p>
                    </div>
                  </div>
                  <p className="text-lg mb-4">Upload screenshots of any professional communication and receive executive-level strategic analysis.</p>
                  <ul className="space-y-2 text-sm">
                    <li>• Power dynamics assessment - Who holds decision-making authority and why</li>
                    <li>• Executive communication patterns - How your boss/clients prefer to receive information</li>
                    <li>• Influence receptivity scoring - When and how they're most open to requests</li>
                    <li>• Strategic positioning recommendations - Exact approaches that get "yes"</li>
                  </ul>
                </div>
                <div className="bg-[#1A1A1A] text-[#F4ECD8] p-6">
                  <p className="text-lg font-bold text-yellow-400 mb-2">EXECUTIVE ADVANTAGE:</p>
                  <p>"Know exactly how to approach any salary negotiation, client meeting, or promotion conversation before you walk in the room."</p>
                </div>
              </div>
            </div>

            {/* Module B */}
            <div className="bg-[#E8DCC0] border-2 border-[#1A1A1A] p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-[#1A1A1A] text-[#F4ECD8] p-3 rounded">
                      <Zap className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">MODULE B: Executive Message Optimizer</h3>
                      <p className="text-sm text-gray-600">CLASSIFICATION: Corporate Persuasion Protocols</p>
                    </div>
                  </div>
                  <p className="text-lg mb-4">Transform any weak email, proposal, or presentation into executive-level communication.</p>
                  <ul className="space-y-2 text-sm">
                    <li>• Authority Building - Position yourself as the obvious choice for promotion</li>
                    <li>• Value Demonstration - Show your worth in terms executives understand</li>
                    <li>• Scarcity Creation - Make your skills appear more valuable and in-demand</li>
                    <li>• Executive Framing - Communicate at C-suite level regardless of your position</li>
                  </ul>
                </div>
                <div className="bg-[#1A1A1A] text-[#F4ECD8] p-6">
                  <p className="text-lg font-bold text-yellow-400 mb-2">EXECUTIVE ADVANTAGE:</p>
                  <p>"Every email becomes a strategic career advancement tool."</p>
                </div>
              </div>
            </div>

            {/* Additional modules would continue here... */}
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section className="bg-[#1A1A1A] text-[#F4ECD8] py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-yellow-400">EXECUTIVE SUCCESS REPORTS</h2>
            <p className="text-xl">Classified case studies from the field</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Case Study 1 */}
            <div className="bg-[#F4ECD8] text-[#1A1A1A] p-8 border-2 border-green-600">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-green-800">CASE FILE: THE $47,000 SALARY INCREASE</h3>
                <p className="text-sm text-green-700">Marketing Manager → Senior Director | 14 months</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="font-bold text-red-800">BEFORE:</p>
                  <p className="text-sm">"I work hard and deliver results, but I'm still making $65,000 after 3 years."</p>
                </div>
                
                <div>
                  <p className="font-bold text-green-800">RESULT:</p>
                  <p className="text-sm">$47,000 salary increase + promotion to Senior Director + equity package</p>
                </div>

                <div className="bg-green-100 p-3 border-l-4 border-green-600">
                  <p className="text-xs"><strong>TACTICAL NOTE:</strong> "Module A analysis revealed her CEO made decisions based on visual data. When she reframed her request around market opportunity instead of personal deserve, everything changed."</p>
                </div>
              </div>
            </div>

            {/* Case Study 2 */}
            <div className="bg-[#F4ECD8] text-[#1A1A1A] p-8 border-2 border-blue-600">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-blue-800">CASE FILE: THE MILLION-DOLLAR CLOSE</h3>
                <p className="text-sm text-blue-700">Senior Sales Rep | Enterprise Software | $1.2M Deal</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="font-bold text-red-800">BEFORE:</p>
                  <p className="text-sm">9-month sales cycle stalled. Client going dark. Deal at risk.</p>
                </div>
                
                <div>
                  <p className="font-bold text-green-800">RESULT:</p>
                  <p className="text-sm">$1.2M deal closed + $240,000 commission + promotion to Enterprise AE</p>
                </div>

                <div className="bg-blue-100 p-3 border-l-4 border-blue-600">
                  <p className="text-xs"><strong>TACTICAL NOTE:</strong> "Module C simulations taught him to read executive psychology under pressure. When he stopped selling and started consulting, the deal closed itself."</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24 bg-[#E8DCC0]">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-6">WHAT IS YOUR CAREER WORTH?</h2>
            <p className="text-xl text-gray-700 mb-8">Consider the mathematics:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {[
                { label: "Average salary increase after promotion", value: "$15,000-$35,000 annually" },
                { label: "Average commission increase from better closing", value: "$50,000-$150,000 annually" },
                { label: "Average consulting rate increase", value: "$25,000-$75,000 annually" },
                { label: "Lifetime career earnings impact", value: "$500,000-$2,000,000" }
              ].map((stat, index) => (
                <div key={index} className="bg-[#1A1A1A] text-[#F4ECD8] p-4">
                  <p className="text-sm mb-2">{stat.label}:</p>
                  <p className="text-lg font-bold text-yellow-400">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1A1A1A] text-[#F4ECD8] p-8 mb-8">
            <div className="mb-6">
              <p className="text-sm uppercase tracking-widest mb-2">EXECUTIVE ACCESS PROTOCOL</p>
              <h3 className="text-3xl font-bold mb-4">CLASSIFIED EXECUTIVE EDITION</h3>
            </div>

            <div className="space-y-4 mb-8">
              <p className="text-2xl">
                <span className="line-through text-gray-400">$20,000 in specialist fees</span>
              </p>
              <p className="text-4xl font-bold text-yellow-400">$47/month</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
              {[
                "Complete Executive Psychology Training System",
                "Unlimited communication analysis for salary negotiations",
                "Unlimited message optimization for career advancement",
                "Complete executive scenario training library",
                "24/7 executive strategy coaching",
                "Professional network intelligence system"
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{feature}</p>
                </div>
              ))}
            </div>

            <div className="bg-green-900 border-2 border-green-400 p-4 mb-8">
              <p className="text-green-400 font-bold">90-DAY EXECUTIVE GUARANTEE</p>
              <p className="text-sm">If your career doesn't advance measurably within 90 days, full refund authorized.</p>
            </div>

            <button className="bg-yellow-400 text-[#1A1A1A] py-4 px-8 text-xl font-bold hover:bg-yellow-300 transition-colors duration-300 w-full">
              REQUEST EXECUTIVE CLEARANCE NOW
            </button>
          </div>

          <div className="bg-red-100 border-2 border-red-600 p-6">
            <h4 className="text-2xl font-bold text-red-800 mb-4">THE DECISION EVERY AMBITIOUS PROFESSIONAL FACES</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <p className="font-bold text-red-800 mb-2">OPTION 1:</p>
                <p className="text-sm">Keep doing what you're doing. Hope your hard work gets noticed. Wait for "your turn." Watch others advance while you wonder why.</p>
              </div>
              <div>
                <p className="font-bold text-green-800 mb-2">OPTION 2:</p>
                <p className="text-sm">Master the psychology that actually determines who gets promoted, who gets the big raises, and who closes the major deals.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-[#1A1A1A] text-[#F4ECD8] py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-2xl mb-4">Your next salary increase will pay for this system for the next 10 years.</p>
          <p className="text-xl mb-8">The question isn't whether you can afford to invest in your career.</p>
          <p className="text-xl font-bold text-yellow-400">The question is: Can you afford to keep getting passed over while others who understand executive psychology get everything you want?</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#E8DCC0] py-8 border-t-4 border-[#1A1A1A]">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm uppercase tracking-widest mb-2">CLASSIFIED ADDENDUM</p>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-600">
            <a href="#" className="hover:text-[#1A1A1A]">Information Security Protocol</a>
            <a href="#" className="hover:text-[#1A1A1A]">Operational Guidelines</a>
            <a href="#" className="hover:text-[#1A1A1A]">Intelligence Support Division</a>
          </div>
        </div>
      </footer>
    </main>
  );
}