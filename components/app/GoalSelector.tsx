'use client';

/* Picks what to talk through, using the people and situations from the book's
   Playbooks (back of the book). Fixed list on purpose: the old database
   categories included offense goals that are no longer part of the product.
   The ids match existing category ids so saved chats keep working. */

import { useState } from 'react';
import {
  ArrowLeft, Briefcase, Users, Heart, HeartCrack, Home, UsersRound, Sofa, Phone, Receipt, Feather,
  type LucideIcon,
} from 'lucide-react';
import { BookRef, Label, PageHeader } from '@/components/app/ui';

interface Goal {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  examples: string[];
}

interface GoalSelectorProps {
  onSelectGoal: (goal: Goal) => void;
}

type Area = { id: string; name: string; description: string; Icon: LucideIcon; situations: string[] };

const AREAS: Area[] = [
  {
    id: 'career', name: 'The boss', Icon: Briefcase,
    description: 'Extra work without extra pay, credit going elsewhere, raises promised and postponed.',
    situations: ['My boss keeps piling more work on me', "I want to ask for a raise I've earned", 'My boss takes credit for my work', 'I get last-minute requests at the end of the day'],
  },
  {
    id: 'career', name: 'A coworker', Icon: Users,
    description: 'Tasks dumped on you, being talked over, quiet undermining.',
    situations: ['A coworker keeps handing me their tasks', 'Someone talks over me in meetings', 'A coworker undermines me behind my back'],
  },
  {
    id: 'relationships', name: 'Your partner', Icon: Heart,
    description: 'The silent treatment, "if you loved me" requests, your needs coming last.',
    situations: ['My partner gives me the silent treatment', 'My partner says things never happened', 'I carry most of the work at home'],
  },
  {
    id: 'relationships', name: 'An ex', Icon: HeartCrack,
    description: 'Guilt about the kids, plans changing at the last minute, old buttons pushed.',
    situations: ['My ex guilt-trips me about the kids', 'My ex keeps changing plans at the last minute', 'My ex pressures me to get back together'],
  },
  {
    id: 'relationships', name: 'Aging parents', Icon: Home,
    description: 'More demands on your time, guilt about visiting, being the one who handles everything.',
    situations: ["My parent guilt-trips me about not visiting enough", "I'm doing all the caregiving alone", 'My parent criticizes how I live'],
  },
  {
    id: 'relationships', name: 'Adult siblings', Icon: UsersRound,
    description: 'Old family roles snapping back, unequal shares of the work and the cost.',
    situations: ['I always end up hosting or paying', 'My sibling leaves our parents to me', 'My sibling remembers our past very differently'],
  },
  {
    id: 'relationships', name: 'In-laws', Icon: Sofa,
    description: 'Overstepping with the kids or the house, holidays as a tug of war.',
    situations: ['My in-laws overstep with our kids', 'Holidays turn into a tug of war', 'My in-laws drop by without asking'],
  },
  {
    id: 'relationships', name: 'The friend who always needs something', Icon: Phone,
    description: 'Long calls, favors that flow one way, a permanent crisis.',
    situations: ['A friend only calls when they need something', "I want to say no without losing the friendship", 'A friend keeps borrowing money'],
  },
  {
    id: 'finance', name: 'Getting what you are owed', Icon: Receipt,
    description: 'Salespeople, contractors, refunds, bills and money people owe you.',
    situations: ['A contractor did not do the work as agreed', 'I want a refund or a wrong charge fixed', 'Someone owes me money and keeps putting me off', 'A salesperson is pushing me to decide today'],
  },
  {
    id: 'personal_power', name: 'Your own patterns', Icon: Feather,
    description: 'Over-apologizing, over-explaining, saying yes before you think.',
    situations: ['I say yes before I even think', 'I over-apologize and over-explain', 'I fold when someone gets annoyed with me'],
  },
];

function iconFor(Icon: LucideIcon) {
  return <Icon className="h-6 w-6 text-[color:var(--app-accent)]" />;
}

export function GoalSelector({ onSelectGoal }: GoalSelectorProps) {
  const [area, setArea] = useState<Area | null>(null);

  const pick = (a: Area, title: string) =>
    onSelectGoal({ id: a.id, title, description: a.description, icon: iconFor(a.Icon), color: 'bg-[color:var(--app-paper-2)]', examples: a.situations });

  if (area) {
    return (
      <div className="max-w-3xl">
        <button
          type="button"
          onClick={() => setArea(null)}
          className="mb-4 inline-flex min-h-[44px] items-center gap-2 text-[15px] text-[color:var(--app-muted)] hover:text-[color:var(--app-ink)]"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <PageHeader kicker="Talk it through" title={area.name} subtitle="Pick the one closest to what's going on, or just start talking." />
        <div className="grid gap-3 sm:grid-cols-2">
          {area.situations.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => pick(area, s)}
              className="min-h-[44px] rounded-xl border border-[color:var(--app-line)] bg-[color:var(--app-card)] p-4 text-left text-[16px] hover:bg-[color:var(--app-paper-2)]"
            >
              {s}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => pick(area, area.name)}
          className="mt-5 min-h-[44px] text-[15px] text-[color:var(--app-accent)] underline underline-offset-2"
        >
          Something else with {area.name.toLowerCase()}
        </button>
        <div className="mt-6">
          <BookRef title="The Playbooks, at the back of the book" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        kicker="Talk it through"
        title="Who is this about?"
        subtitle="Pick the person or situation. You'll talk it through calmly, see what's happening, and work out what you want to say."
      />
      <Label>From the book&apos;s playbooks</Label>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {AREAS.map((a) => (
          <button
            key={a.name}
            type="button"
            onClick={() => setArea(a)}
            className="flex flex-col items-start gap-3 rounded-xl border border-[color:var(--app-line)] bg-[color:var(--app-card)] p-5 text-left transition-colors hover:bg-[color:var(--app-paper-2)]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--app-paper-2)]">{iconFor(a.Icon)}</span>
            <span className="app-serif text-[20px] font-semibold leading-snug">{a.name}</span>
            <span className="text-[15px] leading-snug text-[color:var(--app-muted)]">{a.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
