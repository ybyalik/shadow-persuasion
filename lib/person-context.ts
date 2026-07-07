import { createClient } from '@supabase/supabase-js';

/**
 * Loads a saved person (from the People / Profiler feature) and turns their
 * stored profile into a short plain-English summary that can be dropped into a
 * prompt, so features like War Room and Live Sparring can be personalized to a
 * specific person the user already knows. Always scoped to the caller's uid.
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getPersonContext(
  userId: string,
  personId: string
): Promise<{ name: string; summary: string } | null> {
  try {
    const { data } = await supabase
      .from('user_profiles_people')
      .select('*')
      .eq('id', personId)
      .eq('user_id', userId)
      .single();
    if (!data) return null;

    const parts: string[] = [];
    if (data.relationship_type) parts.push(`Relationship to the user: ${data.relationship_type}.`);

    const comm = (data.traits && data.traits.communication) || {};
    if (comm.summary) parts.push(`Communication style: ${comm.summary}`);
    const tendencies: string[] = [];
    if (typeof comm.directness === 'number')
      tendencies.push(comm.directness >= 60 ? 'direct' : comm.directness <= 40 ? 'indirect' : 'moderately direct');
    if (typeof comm.logicVsEmotion === 'number')
      tendencies.push(
        comm.logicVsEmotion >= 60
          ? 'persuaded by logic and data'
          : comm.logicVsEmotion <= 40
          ? 'persuaded by emotion and relationship'
          : 'moved by a mix of logic and emotion'
      );
    if (typeof comm.assertiveness === 'number')
      tendencies.push(comm.assertiveness >= 60 ? 'assertive' : comm.assertiveness <= 40 ? 'passive' : 'moderately assertive');
    if (tendencies.length) parts.push(`Tendencies: ${tendencies.join(', ')}.`);

    if (Array.isArray(data.key_trait_tags) && data.key_trait_tags.length)
      parts.push(`Key traits: ${data.key_trait_tags.join(', ')}.`);

    const pb = data.playbook;
    if (typeof pb === 'string' && pb.trim()) {
      parts.push(`What tends to work with them: ${pb.trim()}`);
    } else if (pb && typeof pb === 'object') {
      if (pb.approach) parts.push(`Best approach: ${pb.approach}`);
      if (Array.isArray(pb.dos) && pb.dos.length) parts.push(`Do: ${pb.dos.slice(0, 4).join('; ')}.`);
      if (Array.isArray(pb.donts) && pb.donts.length) parts.push(`Avoid: ${pb.donts.slice(0, 4).join('; ')}.`);
    }

    if (data.next_recommended_action) parts.push(`Suggested next move with them: ${data.next_recommended_action}`);
    if (data.notes) parts.push(`The user's own notes: ${String(data.notes).slice(0, 400)}`);

    return { name: data.name, summary: parts.filter(Boolean).join('\n') };
  } catch {
    return null;
  }
}
