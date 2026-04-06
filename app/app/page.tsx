'use client';

import { Eye, MessageSquare, FileText, BookOpen } from 'lucide-react';
import Link from 'next/link';

const actionCards = [
  {
    href: '/app/decode',
    icon: Eye,
    title: 'DECODE',
    description: 'Upload & analyze a conversation.',
  },
  {
    href: '/app/chat',
    icon: MessageSquare,
    title: 'STRATEGIZE',
    description: 'Chat with the Handler.',
  },
  {
    href: '/app/scenarios',
    icon: FileText,
    title: 'PLAYBOOKS',
    description: 'Template scenarios.',
  },
  {
    href: '/app/library',
    icon: BookOpen,
    title: 'LIBRARY',
    description: 'Technique database.',
  },
];

const stats = [
    { label: 'Conversations', value: 0 },
    { label: 'Analyses', value: 0 },
    { label: 'Techniques Mastered', value: 0 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold uppercase font-mono tracking-wider">
          Operations Center
        </h1>
        <div className="flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-green-400">Nominal</span>
        </div>
      </header>

       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {actionCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group block p-6 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#333333] transition-all
             hover:shadow-lg hover:border-[#D4A017]"
          >
              <card.icon className="h-8 w-8 mb-4 text-[#D4A017]" />
              <h2 className="text-lg font-bold font-mono uppercase">{card.title}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{card.description}</p>
          </Link>
        ))}
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-center">
            {stats.map((stat) => (
                <div key={stat.label} className="p-4 bg-white dark:bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-[#333333]">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                </div>
            ))}
      </div>

      <div>
        <h2 className="text-xl font-bold font-mono mb-4">Recent Activity</h2>
        <div className="p-10 text-center bg-white dark:bg-[#1A1A1A] rounded-lg border border-dashed border-gray-200 dark:border-[#333333]">
           <p className="text-gray-500 dark:text-gray-400">No recent activity. Start an operation.</p>
        </div>
      </div>
    </div>
  );
}
