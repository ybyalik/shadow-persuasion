# Brief for reworking the Shadow Persuasion app (/app)

## What this is
The repo `~/projects/shadow-persuasion` (Next.js 16 App Router, Tailwind 3, Supabase DB, Firebase login, OpenRouter for AI) has a member app under `app/app/*` with API routes under `app/api/*`. It was built for an old idea: "dark psychology / win every conversation / become the most strategic person in the room" (spy theme: Operative, Shadow Master, War Room, threat levels, "maximum psychological impact").

The product is now a defense-first self-help book: **"Shadow Persuasion: How to Stop Being Used and Take Your Power Back"** by Nate Harlan, for nice people and people-pleasers aged 35 to 60+ who get guilt-tripped, gaslit, given the silent treatment, overlooked at work. The paperback includes **60 days of this app**. The app's job now: help the reader **see pressure tactics, answer calmly, practice, and get what they are owed fairly**. Every existing feature is being **repurposed, not removed**.

## The book (source of truth, read what you need)
- Chapters: `funnel-v2/chapters/ch-01-*.md` to `ch-26-*.md`, plus `back-01-playbooks.md` (playbooks for boss, coworker, partner, ex, aging parents, adult siblings, in-laws, the friend who always needs something), `back-02-situation-finder.md`, `back-03-tactic-reference.md`.
- Part One, Why you keep getting run over: 1 The 3 A.M. Replay, 2 The Good Person Contract, 3 How They Read You, 4 The Voice in Your Head, 5 Caring Too Much.
- Part Two, The Reset: 6 The 3-Day Quick Start, 7 How the 21 Days Work, 8 Week 1 Notice, 9 Week 2 Pause, 10 Week 3 Hold.
- Part Three, The Tactics They Use on You: 11 Guilt and Obligation, 12 Rewriting the Past, 13 Withdrawal, 14 Charm and Pressure, 15 The Slow Squeeze, 16 Intimidation, 17 Manipulation at Scale, 18 How Groups Pull You In.
- Part Four, Quiet Power: 19 What People Really Want, 20 How You Come Across, 21 Being Heard Without a Fight, 22 Getting What You're Owed, 23 Changing the Frame, 24 Office Politics and Alliances, 25 Making It Stick, 26 The Line You Don't Cross.
- Free bonuses: `funnel-v2/bonuses/tactic-spotter.md` (50 tactics, warning signs, calm reply each), `stop-shrinking.md` (24 phrases that make you sound small), `hard-conversation-planner.md`.
- Journal: `funnel-v2/journal/` (the 21-day reset journal builder has the daily prompts).
- Do NOT put content from `funnel-v2/addon/` (Calm Reply Scripts, a paid $17 add-on) or `funnel-v2/upsell-v2/` (paid $47 pack) into the app.

## Voice and wording (customer-facing copy)
- Calm, warm, plain everyday English, short sentences, like the book. Defense first. The reader stays kind; they just stop being easy to use.
- Part Four "quiet power" is fair influence only: being heard, asking for what you are owed, honest framing. **Never** teach deception, covert control, exploiting someone's insecurities, or "manipulation". If a user asks for that, the AI gently redirects to a fair version (chapter 26 draws the line).
- No spy or aggressive words in the UI: no threat level, operative, handler, mission briefing, target, warfare, counter-script, frame control, NLP, dark psychology, "maximum impact", "power increase". Use: "how much pressure", "calm reply", "what's happening", "your goal", "practice", "today's step".
- Small typewriter labels (`app-type` class) are fine for the case-file look, but the words must be plain.
- **No em-dashes** (—) in any user-facing text or AI instructions' sample outputs. Use commas, periods, or parentheses.
- No invented statistics, testimonials or fake numbers.
- When useful, point to the book: "In the book: Chapter 11, Guilt and Obligation" (use `<BookRef>`).
- Safety: if a message suggests the user is in danger (violence, threats, stalking), the answer says so kindly and gives the US National Domestic Violence Hotline 1-800-799-7233 (text START to 88788). It is not therapy and never claims to be.

## Shared code you MUST use (owned by the lead; do not edit these files)
- `lib/ai.ts`: `aiChat({ userId, feature, messages, model, temperature, maxTokens, json })` returns `{ text, data }`; `aiStream(...)` returns an async generator of text pieces; `readScreenshot({ userId, feature, imageDataUrl })`; `MODELS.smart` (claude-sonnet-5.5: careful reading of real messages, plans, debriefs) and `MODELS.fast` (claude-haiku-5.5: chat turns, role-play, drills, short answers, screenshot reading). Every AI call must go through these (they enforce spend caps and log cost). Use a short, stable `feature` name like `'decode'`, `'spar:turn'`.
- `lib/access.ts`: `requireAppUser(request)` returns `{ uid, email, access }`. Every app API route that does AI or touches user data must call it first (it checks sign-in AND that the person currently has access).
- `lib/api-error.ts`: in `catch`, do `const f = passthroughAuthError(err); if (f) return f;` (this passes through 401, 403 no-access and 429 over-limit responses, which carry a friendly `message`), then `return apiError('Friendly sentence.', 500, '[tag]', err)`. **Never** return raw error text, stack traces or provider messages to the browser.
- `lib/rag.ts`: `searchKnowledge(query)` returns book passages labelled with their chapter (already limited to our book); `searchBook(query)` returns structured passages. The old third-party books are no longer searched.
- `components/app/ui.tsx`: `PageHeader`, `Card`, `Label`, `Button`, `inputClass`, `Notice`, `BookRef`, `friendlyError(res)`. Use them for every page you touch so the app looks consistent.
- Colors: CSS variables on `.sp-app` (set in `app/globals.css`): `--app-paper`, `--app-paper-2`, `--app-card`, `--app-line`, `--app-ink`, `--app-muted`, `--app-accent`, `--app-gold`, `--app-night`, `--app-sage`, `--app-oxblood`. Use them as Tailwind arbitrary values, e.g. `bg-[color:var(--app-card)]`, `text-[color:var(--app-muted)]`. Fonts: `app-serif` (EB Garamond) for titles, default sans (Inter) for body/UI, `app-type` (typewriter) for small labels. Light by default; dark mode works automatically through the variables, so avoid hard-coded `#0A0A0A`, `gray-*`, `#D4A017` and `dark:` classes in what you rewrite.
- Also read-only for you: `lib/prompts.ts` (shared by many routes; put new prompts inside your own route files or a new file `lib/prompts/<your-area>.ts`), `lib/voice-profile.ts`, `lib/person-context.ts`, `lib/auth-api.ts`, `app/app/layout.tsx`, `components/app/Sidebar.tsx`, `app/globals.css`.

## The new menu (already built; your pages must fit these names)
Every day: Today (`/app`), The 21-Day Reset (`/app/field-ops`) · In the moment: Decode a Message (`/app/analyze`), Right Now (`/app/assist`), Calm My Reply (`/app/rewrite`) · Get ready: Plan a Conversation (`/app/warroom`), Rehearse It (`/app/spar`), Practice Scenes (`/app/training`), Spot the Tactic (`/app/techniques`) · Your life: My People (`/app/people`), Goals (`/app/campaigns`), Talk It Through (`/app/chat`), My Progress (`/app/score`). `/app/defense` should redirect to `/app/analyze`.

## Rules of the road
- Work only in the files listed for your area. If you need a change in a shared file, say exactly what in your final report instead of editing it.
- Keep existing database tables; add columns or tables with a new migration file using **only your assigned number**, then apply it:
  `cd ~/projects/shadow-persuasion && supabase db query --linked --project-ref zpedstfjphsyfvjkgexg -f supabase/migrations/<file>.sql && git checkout -- supabase/.temp/cli-latest`
  End migration files with `NOTIFY pgrst, 'reload schema';`. Never drop or delete existing tables or rows.
- A dev server is already running at http://localhost:3040. Do NOT start, stop or restart servers, and **never run `next build`**. Check your work with `npx tsc --noEmit` (filter to your files) and `npx eslint <your files>`.
- Test your API routes for real: `T=$(scripts/app-test-token.sh)` prints a sign-in token for a local test account that has app access; then `curl -s localhost:3040/api/<route> -H "Authorization: Bearer $T" -H 'Content-Type: application/json' -d '{...}'`. Confirm a request without a token gets 401. Keep AI test calls modest (a handful per route).
- Do not commit, push or deploy. Do not change Stripe, pricing, login, or anything under `app/v2`, `lib/sp2`, `app/(marketing)`, `app/lp`.
- Keep pages working on a phone (375px wide): no horizontal scrolling, tap targets at least 44px.

## Final report (keep it under 400 words)
Files changed, migrations added/applied, what you tested and the results (including one sample AI output per main route, trimmed), anything you need changed in a shared file, and anything left undone.
