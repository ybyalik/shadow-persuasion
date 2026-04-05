'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import { GoalSelector } from '@/components/app/GoalSelector';
import { StrategicChat } from '@/components/app/StrategicChat';

interface Goal {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    examples: string[];
}

// Mock data for now
const conversations = [
  // { id: '1', title: 'Negotiating a pay rise', lastMessage: '...', timestamp: '2h ago'},
  // { id: '2', title: 'Handling a difficult client', lastMessage: '...', timestamp: '1d ago'},
];

export default function ChatListPage() {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showGoalSelector, setShowGoalSelector] = useState(false);

  const handleSelectGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowGoalSelector(false);
  };

  const handleBackToList = () => {
    setSelectedGoal(null);
    setShowGoalSelector(false);
  };

  const handleBackToGoals = () => {
    setSelectedGoal(null);
    setShowGoalSelector(true);
  };

  // Strategic Chat Session
  if (selectedGoal) {
    return <StrategicChat goal={selectedGoal} onBack={handleBackToGoals} />;
  }

  // Goal Selection
  if (showGoalSelector) {
    return (
      <div className="space-y-6">
        <button
          onClick={handleBackToList}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sessions
        </button>
        <GoalSelector onSelectGoal={handleSelectGoal} />
      </div>
    );
  }

  // Main Chat List
  return (
    <div className="space-y-8">
       <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold uppercase font-mono tracking-wider">
              Strategic Communication Sessions
          </h1>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowGoalSelector(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-[#D4A017] text-[#0A0A0A] rounded-lg font-semibold hover:bg-[#E8B030] transition-colors"
            >
              <PlusCircle className="h-5 w-5" />
              <span>New Strategic Session</span>
            </button>
            <Link href="/app/chat/new" className="inline-flex items-center space-x-2 px-4 py-2 bg-[#333333] text-white rounded-lg font-semibold hover:bg-[#444444] transition-colors">
              <span>Legacy Chat</span>
            </Link>
          </div>
      </header>
      
      {conversations.length > 0 ? (
        <div className="space-y-4">
          {conversations.map(convo => (
            <Link href={`/app/chat/${convo.id}`} key={convo.id} className="block p-4 bg-[#1A1A1A] rounded-lg border border-[#333333] hover:border-[#D4A017]">
                <h2 className="font-bold">{convo.title}</h2>
                <p className="text-sm text-gray-400 truncate">{convo.lastMessage}</p>
                <p className="text-xs text-gray-500 mt-2">{convo.timestamp}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Strategic Session CTA */}
          <div 
            onClick={() => setShowGoalSelector(true)}
            className="p-8 text-center rounded-lg border-2 border-dashed border-[#D4A017] hover:border-[#F4D03F] hover:bg-[#2A2520] transition-all cursor-pointer group"
          >
            <div className="space-y-4">
              <div className="text-6xl">🎯</div>
              <div>
                <h3 className="text-xl font-bold text-[#D4A017] group-hover:text-[#F4D03F] transition-colors">
                  Start Your First Strategic Session
                </h3>
                <p className="text-gray-400 mt-2 max-w-md mx-auto">
                  Get goal-focused coaching with specific tactics, exact scripts, and real-time guidance 
                  for negotiations, influence, relationships, and more.
                </p>
              </div>
              <button className="bg-[#D4A017] text-[#0A0A0A] px-6 py-3 rounded-lg font-semibold hover:bg-[#F4D03F] transition-colors">
                Choose Your Objective
              </button>
            </div>
          </div>

          {/* Legacy Chat Option */}
          <div className="p-6 text-center rounded-lg border border-[#333333] bg-[#1A1A1A]">
            <p className="text-gray-400 mb-4">
              Or continue with the general-purpose chat for open-ended conversations
            </p>
            <Link 
              href="/app/chat/new"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-[#333333] text-white rounded-lg font-semibold hover:bg-[#444444] transition-colors"
            >
              <span>Open General Chat</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
