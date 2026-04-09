import React from 'react';

/**
 * Parses text containing (Source: "Book Title" by Author) citations
 * and renders them as styled inline badges.
 */
export function formatWithCitations(text: string): React.ReactNode[] {
  if (!text) return [];

  const parts: React.ReactNode[] = [];
  const regex = /\(Source:\s*"([^"]+)"\s*by\s*([^)]+)\)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Text before the citation
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    // The citation badge
    const bookTitle = match[1];
    const author = match[2].trim();
    parts.push(
      <span
        key={match.index}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 text-[10px] font-mono rounded bg-[#D4A017]/10 text-[#D4A017] border border-[#D4A017]/20 whitespace-nowrap"
        title={`${bookTitle} by ${author}`}
      >
        📖 {bookTitle}
      </span>
    );

    lastIndex = match.index + match[0].length;
  }

  // Remaining text after last citation
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}
