import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserFromRequest } from '@/lib/auth-api';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Map any category string to one of the 6 standard skill areas
function mapToSkillArea(category: string | undefined | null): string {
  if (!category) return 'persuasion'; // default
  const lower = category.toLowerCase();
  if (lower.includes('rapport') || lower.includes('mirror') || lower.includes('empathy') || lower.includes('relationship')) return 'rapport';
  if (lower.includes('negotiat') || lower.includes('anchor') || lower.includes('contrast') || lower.includes('takeaway') || lower.includes('door')) return 'negotiation';
  if (lower.includes('influence') || lower.includes('persuasi') || lower.includes('reciproc') || lower.includes('scarcit') || lower.includes('social_proof') || lower.includes('commit')) return 'persuasion';
  if (lower.includes('frame') || lower.includes('conflict') || lower.includes('pattern') || lower.includes('authority') || lower.includes('reframe')) return 'conflict';
  if (lower.includes('defense') || lower.includes('defend') || lower.includes('accusation') || lower.includes('manipulation') || lower.includes('gaslight') || lower.includes('toxic') || lower.includes('dark')) return 'defense';
  if (lower.includes('read') || lower.includes('decode') || lower.includes('analyz') || lower.includes('profil') || lower.includes('body_language') || lower.includes('nlp')) return 'reading';
  return 'persuasion'; // default fallback
}

function calculateStreak(completions: any[]): { current: number; longest: number } {
  if (completions.length === 0) return { current: 0, longest: 0 };

  const dates = Array.from(
    new Set(
      completions.map((c) => {
        const d = new Date(c.completed_at || c.created_at);
        return d.toISOString().split('T')[0];
      })
    )
  ).sort((a, b) => b.localeCompare(a));

  if (dates.length === 0) return { current: 0, longest: 0 };

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let current = 0;
  if (dates[0] === today || dates[0] === yesterday) {
    current = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diff = (prev.getTime() - curr.getTime()) / 86400000;
      if (diff === 1) {
        current++;
      } else {
        break;
      }
    }
  }

  let longest = 1;
  let run = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (diff === 1) {
      run++;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }

  return { current, longest: Math.max(longest, current) };
}

// GET: Aggregated progress data for the user
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);

    const userFilter = (query: any) => {
      if (userId) return query.eq('user_id', userId);
      return query.is('user_id', null);
    };

    // Fetch all data sources in parallel
    const [missionsRes, practiceRes, reportsRes, feedbackRes, analysesRes] = await Promise.all([
      userFilter(supabase.from('mission_completions').select('*')),
      userFilter(supabase.from('practice_results').select('*')),
      userFilter(supabase.from('field_reports').select('*')),
      userFilter(supabase.from('user_feedback').select('*')),
      userFilter(supabase.from('analysis_history').select('id, threat_score, techniques_identified, created_at, user_id')),
    ]);

    const missions = missionsRes.data || [];
    const practiceResults = practiceRes.data || [];
    const reports = reportsRes.data || [];
    const feedback = feedbackRes.data || [];
    const analyses = analysesRes.data || [];

    // Total XP: sum from all sources
    let totalXP = 0;
    for (const m of missions) totalXP += m.xp_earned ?? 10;
    for (const p of practiceResults) totalXP += p.xp_earned ?? 5;
    for (const r of reports) totalXP += r.xp_earned ?? 10;
    for (const a of analyses) totalXP += 5; // 5 XP per analysis

    // Current streak from mission completions
    const streak = calculateStreak(missions);

    // Techniques used: collect from field_reports and practice_results
    const techniqueSet = new Set<string>();
    const techUsage = new Map<string, { count: number; successSum: number; category?: string }>();

    const addTech = (id: string, success: number, category?: string) => {
      techniqueSet.add(id);
      const mappedCategory = mapToSkillArea(category || id);
      const existing = techUsage.get(id) || { count: 0, successSum: 0, category: mappedCategory };
      existing.count += 1;
      existing.successSum += success;
      if (!existing.category || existing.category === 'persuasion') existing.category = mappedCategory;
      techUsage.set(id, existing);
    };

    for (const m of missions) {
      if (m.technique_id) addTech(m.technique_id, 70, m.category);
    }
    for (const p of practiceResults) {
      if (p.techniques_used && Array.isArray(p.techniques_used)) {
        for (const t of p.techniques_used) {
          addTech(t, p.score ?? 50, p.category);
        }
      }
    }
    for (const r of reports) {
      if (r.techniques && Array.isArray(r.techniques)) {
        for (const t of r.techniques) {
          addTech(t, 60, r.category);
        }
      }
    }
    for (const f of feedback) {
      if (f.technique_id) {
        const success = f.outcome === 'worked' ? 100 : f.outcome === 'partially' ? 50 : 10;
        addTech(f.technique_id, success, f.category);
      }
    }
    for (const a of analyses) {
      if (a.techniques_identified && Array.isArray(a.techniques_identified)) {
        for (const t of a.techniques_identified) {
          addTech(t, 60, 'reading'); // analyses count toward Reading People
        }
      }
    }

    // Sub-scores by the 6 standard skill areas
    const skillAreas = ['rapport', 'negotiation', 'persuasion', 'conflict', 'defense', 'reading'];
    const categoryStats = new Map<string, { total: number; successSum: number }>();
    for (const area of skillAreas) categoryStats.set(area, { total: 0, successSum: 0 });

    for (const [, data] of techUsage) {
      const cat = data.category || 'persuasion';
      const existing = categoryStats.get(cat) || { total: 0, successSum: 0 };
      existing.total += data.count;
      existing.successSum += data.successSum;
      categoryStats.set(cat, existing);
    }

    const subScores: Record<string, number> = {};
    for (const area of skillAreas) {
      const data = categoryStats.get(area) || { total: 0, successSum: 0 };
      subScores[area] = data.total > 0 ? Math.round(data.successSum / data.total) : 0;
    }

    // Recent activity feed
    type ActivityItem = {
      type: string;
      label: string;
      date: string;
      techniqueId?: string;
    };

    const activity: ActivityItem[] = [];

    for (const m of missions) {
      activity.push({
        type: 'mission',
        label: `Completed mission${m.technique_id ? `: ${m.technique_id}` : ''}`,
        date: m.completed_at || m.created_at,
        techniqueId: m.technique_id,
      });
    }

    for (const r of reports) {
      activity.push({
        type: 'journal',
        label: 'Field report logged',
        date: r.created_at,
      });
    }

    for (const p of practiceResults) {
      activity.push({
        type: 'practice',
        label: `Practice session (${p.score ?? 0}/100)`,
        date: p.created_at,
      });
    }

    for (const f of feedback) {
      activity.push({
        type: 'feedback',
        label: `Feedback: ${f.outcome || 'submitted'}`,
        date: f.created_at,
      });
    }
    for (const a of analyses) {
      activity.push({
        type: 'analysis',
        label: `Conversation analyzed${a.threat_score ? ` (threat: ${a.threat_score}/10)` : ''}`,
        date: a.created_at,
      });
    }

    activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Compute overall score (0-100, capped at 1000 XP)
    const score = Math.min(100, Math.round((totalXP / 1000) * 100));

    return NextResponse.json({
      totalXP,
      score,
      streak,
      techniquesUsed: techniqueSet.size,
      techniqueDetails: Object.fromEntries(techUsage),
      subScores,
      recentActivity: activity.slice(0, 20),
      stats: {
        totalXP,
        streak: streak.current,
        techniquesMastered: Array.from(techUsage.values()).filter(t => t.count >= 3).length,
        fieldReports: reports.length,
        sparringSessions: practiceResults.filter(p => p.type === 'scenario' || p.type === 'sparring').length,
        missionsCompleted: missions.length,
        analysesRun: analyses.length,
      },
    });
  } catch (error) {
    console.error('[USER_PROGRESS]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
