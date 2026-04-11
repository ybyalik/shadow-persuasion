'use client';

import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { renderMarkdown } from '@/lib/markdown';

type Source = { book: string; author: string; technique: string; similarity: number };

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
  sources?: Source[];
}

export function ChatMessage({ role, content, isLoading, sources }: ChatMessageProps) {
  const [showSources, setShowSources] = useState(false);
  const [copied, setCopied] = useState(false);
  const isUser = role === 'user';
  const formattedContent = renderMarkdown(content);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Deduplicate sources by book+technique
  const uniqueSources = sources?.filter((s, i, arr) => 
    arr.findIndex(x => x.book === s.book && x.technique === s.technique) === i
  );
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-2xl rounded-lg relative ${
          isUser
            ? 'p-4 bg-[#D4A017] text-[#0A0A0A]'
            : 'group bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333]'
        }`}
      >
        {!isUser && !isLoading && (
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 rounded-md bg-gray-100 dark:bg-[#333333] hover:bg-gray-200 dark:hover:bg-[#444444] transition-all opacity-60 md:opacity-0 md:group-hover:opacity-100 z-10"
            title="Copy message"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />}
          </button>
        )}
        {!isUser && (
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <span className="text-xs font-mono uppercase text-[#D4A017] tracking-wider">Handler</span>
            {uniqueSources && uniqueSources.length > 0 && (
              <button 
                onClick={() => setShowSources(!showSources)}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <BookOpen className="h-3 w-3" />
                {uniqueSources.length} source{uniqueSources.length > 1 ? 's' : ''} used
                {showSources ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            )}
          </div>
        )}

        {/* Sources panel */}
        {!isUser && showSources && uniqueSources && uniqueSources.length > 0 && (
          <div className="mx-4 mb-2 p-3 bg-gray-50 dark:bg-[#111] rounded-lg border border-blue-500/20">
            <div className="text-xs font-mono text-blue-400 uppercase mb-2">Knowledge Base Sources</div>
            <div className="space-y-1.5">
              {uniqueSources.map((source, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-gray-800 dark:text-[#E8E8E0]">{source.technique}</span>
                    <span className="text-gray-500 ml-2">from "{source.book}" by {source.author}</span>
                  </div>
                  <span className="text-blue-400 font-mono ml-3">{source.similarity}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="px-4 pb-3">
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
            </div>
          ) : (
            <div 
              className="text-sm text-gray-600 dark:text-[#ccc] leading-relaxed" 
              dangerouslySetInnerHTML={{ __html: formattedContent }} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
