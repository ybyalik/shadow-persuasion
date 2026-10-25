/** Safety lines shared by the Reset reflections (daily note and weekly review). */

export const HOTLINE =
  'If someone is hurting you, threatening you, or you feel unsafe, please reach out: the National Domestic Violence Hotline is 1-800-799-7233, or text START to 88788. You do not have to handle this alone.';

export const DANGER = /\b(hit|hits|hitting|punch|slap|chok|strangl|hurt me|hurts me|threaten|stalk|kill|weapon|gun|knife|afraid for my (life|safety)|scared for my (life|safety)|abus|violent|unsafe)/i;

/** Removes dashes the style guide doesn't allow, and adds the hotline when the writing suggests danger. */
export function finishReflection(text: string, source: string): string {
  let out = text.replace(/\s*[—–]\s*/g, ', ').replace(/\s+,/g, ',').trim();
  if (out && DANGER.test(source) && !out.includes('799-7233')) out += `\n\n${HOTLINE}`;
  return out;
}
