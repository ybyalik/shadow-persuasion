'use client';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
}

function parseMarkdown(text: string): string {
  return text
    // Headers
    .replace(/^### (.*$)/gm, '<h3 class="text-base font-bold text-[#E8E8E0] mt-4 mb-1">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-lg font-bold text-[#E8E8E0] mt-4 mb-1">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold text-[#D4A017] mt-4 mb-2">$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#E8E8E0] font-semibold">$1</strong>')
    // Technique tags
    .replace(/\[TECHNIQUE: (.*?)\]/g, '<span class="inline-block bg-[#D4A017] text-[#0A0A0A] px-2 py-0.5 rounded text-xs font-mono font-bold mt-1 mb-1">$1</span>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Numbered lists
    .replace(/^(\d+)\. (.*$)/gm, '<div class="flex gap-2 ml-2 my-0.5"><span class="text-[#D4A017] font-mono text-sm">$1.</span><span class="text-[#ccc]">$2</span></div>')
    // Bullet lists
    .replace(/^[-•] (.*$)/gm, '<div class="flex gap-2 ml-2 my-0.5"><span class="text-[#D4A017]">→</span><span class="text-[#ccc]">$1</span></div>')
    // Line breaks (double newline = paragraph break)
    .replace(/\n\n/g, '<div class="h-3"></div>')
    // Single newlines
    .replace(/\n/g, '<br/>');
}

export function ChatMessage({ role, content, isLoading }: ChatMessageProps) {
  const isUser = role === 'user';
  const formattedContent = parseMarkdown(content);
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-2xl p-4 rounded-lg ${
          isUser
            ? 'bg-[#D4A017] text-[#0A0A0A]'
            : 'bg-[#1A1A1A] border border-[#333333]'
        }`}
      >
        {!isUser && (
          <div className="text-xs font-mono uppercase text-[#D4A017] mb-2 tracking-wider">
            Handler
          </div>
        )}
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
          </div>
        ) : (
          <div 
            className="text-sm text-[#ccc] leading-relaxed" 
            dangerouslySetInnerHTML={{ __html: formattedContent }} 
          />
        )}
      </div>
    </div>
  );
}
