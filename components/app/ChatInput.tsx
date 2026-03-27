'use client';

import { Send } from 'lucide-react';
import { useState } from 'react';

interface ChatInputProps {
  onSend: (input: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
            }
        }}
        placeholder="Ask the Handler..."
        rows={1}
        className="flex-1 p-2 bg-[#222222] text-[#E8E8E0] placeholder-gray-500 rounded-lg border border-[#333333] focus:ring-2 focus:ring-[#D4A017] focus:outline-none resize-none"
        disabled={isLoading}
      />
      <button
        type="submit"
        className="p-2 bg-[#D4A017] text-[#0A0A0A] rounded-full disabled:opacity-50"
        disabled={isLoading || !input.trim()}
      >
        <Send className="h-5 w-5" />
      </button>
    </form>
  );
}
