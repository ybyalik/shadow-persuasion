'use client';

import { useState } from 'react';
import { techniques } from '@/lib/techniques';
import { TechniqueCard } from '@/components/app/TechniqueCard';

const categories = ['All', 'Influence', 'Negotiation', 'Rapport', 'Framing', 'Defense'];

export default function LibraryPage() {
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTechniques = techniques
    .filter(t => filter === 'All' || t.category === filter)
    .filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.description.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold uppercase font-mono tracking-wider">
          Technique Library
        </h1>
        <p className="text-gray-400 mt-1">The operator's manual for influence.</p>
      </header>
      
      <div className="flex flex-col md:flex-row gap-4">
        <input 
            type="text"
            placeholder="Search techniques..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 p-2 bg-[#222222] rounded-lg border border-[#333333] focus:ring-2 focus:ring-[#D4A017]"
        />
        <div className="flex-1 flex items-center space-x-2 overflow-x-auto">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-3 py-1 text-sm rounded-full font-semibold transition-colors whitespace-nowrap
                  ${filter === category 
                    ? 'bg-[#D4A017] text-[#0A0A0A]' 
                    : 'bg-transparent hover:bg-[#222222]'}
                `}
              >
                {category}
              </button>
            ))}
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTechniques.map(technique => (
          <TechniqueCard key={technique.id} technique={technique} />
        ))}
      </div>
    </div>
  );
}
