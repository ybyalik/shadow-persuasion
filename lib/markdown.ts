function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderMarkdown(text: string): string {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[TECHNIQUE: (.*?)\]/g, '<span class="inline-block bg-[#D4A017] text-[#0A0A0A] px-2 py-0.5 rounded text-xs font-mono font-bold mt-1 mb-1">$1</span>')
    .replace(/\(Source: &amp;quot;(.*?)&amp;quot; by (.*?)\)/g, '<span class="inline-flex items-center gap-1 text-xs bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full mx-0.5">\ud83d\udcd6 $1</span>')
    .replace(/\(Source: "(.*?)" by (.*?)\)/g, '<span class="inline-flex items-center gap-1 text-xs bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full mx-0.5">\ud83d\udcd6 $1</span>')
    .replace(/^### (.*$)/gm, '<h3 class="text-base font-bold mt-4 mb-1">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-lg font-bold mt-4 mb-1">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold text-[#D4A017] mt-4 mb-2">$1</h1>')
    .replace(/^(\d+)\. (.*$)/gm, '<div class="flex gap-2 ml-2 my-0.5"><span class="text-[#D4A017] font-mono text-sm">$1.</span><span>$2</span></div>')
    .replace(/^[-\u2022] (.*$)/gm, '<div class="flex gap-2 ml-2 my-0.5"><span class="text-[#D4A017]">\u2192</span><span>$1</span></div>')
    .replace(/\n\n/g, '<div class="h-3"></div>')
    .replace(/\n/g, '<br/>');
}
