import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserFromRequest } from '@/lib/auth-api';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    const [missionsRes, practiceRes, reportsRes, feedbackRes] = await Promise.all([
      userFilter(supabase.from('mission_completions').select('*')),
      userFilter(supabase.from('practice_results').select('*')),
      userFilter(supabase.from('field_reports').select('*')),
      userFilter(supabase.from('user_feedback').select('*')),
    ]);

    const missions = missionsRes.data || [];
    const practiceResults = practiceRes.data || [];
    const reports = reportsRes.data || [];
    const feedback = feedbackRes.data || [];

    // Total XP: sum xp_earned from missions, practice_results; 10xp per field report
    let totalXP = 0;
    for (const m of missions) totalXP += m.xp_earned ?? 10;
    for (const p of practiceResults) totalXP += p.xp_earned ?? 0;
    for (const r of reports) totalXP += r.xp_earned ?? 10;

    // Current streak from mission completions
    const streak = calculateStreak(missions);

    // Techniques used: collect from field_reports and practice_results
    const techniqueSet = new Set<string>();
    const techUsage = new Map<string, { count: number; successSum: number; category?: string }>();

    const addTech = (id: string, success: number, category?: string) => {
      techniqueSet.add(id);
      const existing = techUsage.get(id) || { count: 0, successSum: 0, category };
      existing.count += 1;
      existing.successSum += success;
      if (category) existing.category = category;
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

    // Sub-scores by category
    const categoryStats = new Map<string, { total: number; successSum: number }>();
    for (const [, data] of techUsage) {
      const cat = data.category || 'Unknown';
      const existing = categoryStats.get(cat) || { total: 0, successSum: 0 };
      existing.total += data.count;
      existing.successSum += data.successSum;
      categoryStats.set(cat, existing);
    }

    const subScores: Record<string, number> = {};
    for (const [cat, data] of categoryStats) {
      subScores[cat] = data.total > 0 ? Math.round(data.successSum / data.total) : 0;
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

    activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      totalXP,
      streak,
      techniquesUsed: techniqueSet.size,
      techniqueDetails: Object.fromEntries(techUsage),
      subScores,
      recentActivity: activity.slice(0, 20),
    });
  } catch (error) {
    console.error('[USER PROGRESS GET] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
