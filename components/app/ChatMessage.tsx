'use client';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
}

export function ChatMessage({ role, content, isLoading }: ChatMessageProps) {
  const isUser = role === 'user';

  // A simple markdown-to-html for bolding and techniques
  const formattedContent = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[TECHNIQUE: (.*?)\]/g, '<span class="bg-[#D4A017] text-[#0A0A0A] px-2 py-1 rounded-md text-sm font-mono">$1</span>');
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xl p-3 rounded-lg ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-[#1A1A1A] border border-[#333333]'
        }`}
      >
        {!isUser && (
          <div className="text-xs font-mono uppercase text-[#D4A017] mb-1">
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
             <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: formattedContent }} />
        )}
      </div>
    </div>
  );
}
