/** The v2 sections for each problem page, by slug. Shape: app/p/sections.ts. */
import type { ProblemSections } from '../sections';
import narcParent from './narcissistic-parent';
import gaslighting from './gaslighting';
import narcEx from './narcissistic-ex';
import peoplePleasing from './people-pleasing';
import manipulation from './manipulation-tactics';
import silentTreatment from './silent-treatment';
import loveBombing from './love-bombing';
import ideaCredit from './idea-credit';
import twoJobs from './two-jobs';

export const SECTIONS: Record<string, ProblemSections> = {
  'narcissistic-parent': narcParent,
  gaslighting,
  'narcissistic-ex': narcEx,
  'people-pleasing': peoplePleasing,
  'manipulation-tactics': manipulation,
  'silent-treatment': silentTreatment,
  'love-bombing': loveBombing,
  'idea-credit': ideaCredit,
  'two-jobs': twoJobs,
};
