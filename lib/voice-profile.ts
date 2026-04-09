import { supabase } from './rag';

export interface VoiceProfile {
  personality?: string;
  writingStyle?: string;
  tone?: string;
  sampleTexts?: string[];
}

export async function getVoiceProfile(userId: string | null): Promise<string> {
  if (!userId) return '';

  try {
    const { data } = await supabase
      .from('user_profiles')
      .select('voice_profile')
      .eq('firebase_uid', userId)
      .single();

    if (!data?.voice_profile) return '';

    const vp = data.voice_profile as VoiceProfile;
    if (!vp.personality && !vp.writingStyle && !vp.tone && !vp.sampleTexts?.length) return '';

    let prompt = '\n\nUSER VOICE PROFILE — Match this person\'s communication style:\n';
    if (vp.personality) prompt += `Personality: ${vp.personality}\n`;
    if (vp.writingStyle) prompt += `Writing Style: ${vp.writingStyle}\n`;
    if (vp.tone) prompt += `Preferred Tone: ${vp.tone}\n`;
    if (vp.sampleTexts?.length) {
      prompt += `Sample Messages (match this voice):\n`;
      vp.sampleTexts.slice(0, 3).forEach((s, i) => {
        prompt += `  Example ${i + 1}: "${s.slice(0, 500)}"\n`;
      });
    }
    prompt += `\nCRITICAL — VOICE MATCHING REQUIREMENTS:
- Every counter-script, response option, suggested message, and "say this" MUST sound like this person wrote it
- Match their vocabulary, sentence length, humor level, tone, and personality exactly
- If they are funny/casual, the responses should be funny/casual — NOT corporate or formal
- If they use short sentences, use short sentences. If they use slang, use slang.
- Read their sample messages carefully and mimic that exact voice
- Do NOT generate generic professional language unless that matches their actual style
`;

    return prompt;
  } catch {
    return '';
  }
}
