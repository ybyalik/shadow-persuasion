# Shadow Persuasion — Product Specification

**Version:** 1.0  
**Date:** 2026-03-27  
**Type:** AI-Powered Dark Psychology Membership Platform  
**Price:** $47/month core tier  

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Core AI Features](#2-core-ai-features)
3. [UX Flows — Every Screen](#3-ux-flows)
4. [Template Scenarios (35+)](#4-template-scenarios)
5. [Knowledge Base Architecture](#5-knowledge-base-architecture)
6. [Digital Product / Course Components](#6-course-components)
7. [Gamification & Engagement](#7-gamification--engagement)
8. [Monetization Strategy](#8-monetization-strategy)
9. [Technical Architecture](#9-technical-architecture)
10. [Competitive Analysis](#10-competitive-analysis)
11. [MVP vs Full Product Roadmap](#11-mvp-vs-full-product)

---

## 1. Product Overview

### One-Liner
Shadow Persuasion is an AI coach that reads your conversations, identifies the psychological game being played, and tells you exactly what to say next — grounded in 20+ published frameworks on influence, persuasion, and dark psychology.

### Why It Wins
Most "persuasion training" is passive: read a book, watch a course, hope you remember it in the moment. Shadow Persuasion is **active and contextual** — you paste a real conversation, and the AI tells you what technique is being used on you, what counter-move to deploy, and gives you copy-paste responses tuned to your chosen persona.

### Target Users (Priority Order)
1. **Sales professionals** — need to close, handle objections, negotiate contracts daily
2. **Career climbers** — navigating office politics, salary negotiations, promotions
3. **Dating market participants** — men and women wanting tactical advantage in attraction/relationships
4. **Founders/entrepreneurs** — fundraising, partnerships, hiring negotiations
5. **Anyone who feels outmaneuvered** — people who suspect they're being manipulated and want to recognize + counter it

### Core Value Proposition
- **Reactive:** "Someone is doing X to me — what do I do?"
- **Proactive:** "I want outcome Y — what's the playbook?"
- **Educational:** "I want to understand the psychology behind human influence"

---

## 2. Core AI Features

### 2.1 Screenshot Analysis ("Decode")

**What it does:** User uploads a screenshot of any conversation (iMessage, WhatsApp, Slack, email, LinkedIn DM, Tinder, etc.) → AI performs vision analysis → returns a tactical breakdown.

**Output structure:**
```
┌─────────────────────────────────────────┐
│ 🔍 CONVERSATION DECODE                  │
├─────────────────────────────────────────┤
│ Power Dynamic: They hold frame (7/10)   │
│                                         │
│ Techniques Detected:                    │
│ • Scarcity play (line 3) — "I have     │
│   other candidates..."                  │
│ • Anchoring (line 5) — started with     │
│   low offer to set baseline             │
│ • Social proof (line 7) — "Most people  │
│   accept this range"                    │
│                                         │
│ Your Position: Reactive/defensive       │
│                                         │
│ ⚡ RECOMMENDED RESPONSES (3 options):   │
│                                         │
│ 🗡️ Aggressive: "I appreciate the       │
│ transparency. My number is [X] and      │
│ that's firm. I have competing offers    │
│ that exceed this. When can you get      │
│ back to me?"                            │
│                                         │
│ 🎭 Subtle: "That's helpful context.     │
│ I want to make sure we're both getting  │
│ a great deal here. What does the top    │
│ of your approved range look like?"      │
│                                         │
│ 🧠 Analytical: "I've done extensive     │
│ market research and the 75th            │
│ percentile for this role in [city] is   │
│ [X]. Here's my reasoning..."            │
│                                         │
│ 📚 Framework: Cialdini's Scarcity +     │
│ Voss's "Calibrated Questions"           │
│ (Never Split the Difference, Ch. 7)    │
└─────────────────────────────────────────┘
```

**Key capabilities:**
- Handles **any messaging format** — the vision model detects the UI pattern
- Identifies **who has the upper hand** and scores the power dynamic
- Names the **specific techniques** being used, with line-level attribution
- Provides **3 response options** in different tones (user can set default)
- Cites the **source framework/book** for each recommendation
- Stores the analysis for the user's history/progress tracking

**Edge cases to handle:**
- Blurry/low-res screenshots → ask for re-upload or text paste fallback
- Non-English conversations → support top 10 languages, flag if unsupported
- Screenshots with no clear conversation → "This doesn't appear to be a conversation. Try pasting the text instead."
- Very long screenshot chains → allow multi-image upload, stitch context

### 2.2 AI Coach Chat ("Strategize")

**What it does:** Free-form chat interface. User describes a situation, goal, or asks a question → AI responds with tactical advice grounded in the knowledge base.

**Modes within Coach Chat:**

#### a) Situation Analysis
User: *"My boss keeps taking credit for my work in meetings. Last week she presented my Q1 analysis as her own to the VP."*

AI provides:
- What's happening (technique identification: credit theft / information asymmetry)
- Why they're doing it (motivation analysis)
- 3 tactical responses ranked by risk/reward
- Long-game strategy (not just the next move)
- Relevant frameworks with citations

#### b) Goal Planning
User: *"I want to get promoted to Director within 6 months."*

AI provides:
- Influence map: who are the decision-makers, what do they value
- Step-by-step campaign plan
- Specific tactics for each stakeholder
- Timeline with milestones
- Risks and contingencies

#### c) Real-Time Coaching
User: *"I'm about to walk into a salary negotiation in 20 minutes. They offered $120k, I want $150k."*

AI provides:
- Pre-meeting frame-setting script
- Opening line options
- Anticipated objections + counter-responses
- BATNA analysis
- Walk-away signals to watch for
- Post-meeting follow-up template

#### d) Technique Deep-Dive
User: *"Explain the Ben Franklin Effect and give me 5 ways to use it at work."*

AI provides:
- Framework explanation with source citation
- Real-world application examples
- Do's and don'ts
- Related techniques to stack
- Practice exercise

### 2.3 Role-Play Simulator ("Spar")

**What it does:** AI simulates the other party in a conversation so the user can practice before the real thing.

**Flow:**
1. User selects scenario (template or custom description)
2. User chooses difficulty: Easy (cooperative counterpart), Medium (resistant), Hard (actively hostile/manipulative)
3. User sets the other party's profile (boss, client, date, etc.)
4. AI plays that role, deploying realistic resistance and techniques
5. After each exchange, AI provides a sidebar coaching note (optional — can be toggled off for "exam mode")
6. Post-session debrief: scored performance, technique usage, missed opportunities, improvement suggestions

**Unique mechanic — "Reveal Mode":**
After completing a role-play, user can toggle "Reveal" to see the AI's internal reasoning — what techniques it was deploying against the user, why it chose those responses, and what would have countered them. This is the core learning loop.

### 2.4 Template Scenarios ("Playbooks")

Pre-built guided flows for common high-stakes situations. Each playbook contains:
- **Situation briefing** — context and stakes
- **Psychological framework** — which principles apply and why
- **Phase-by-phase script** — what to say/do at each stage
- **Branching responses** — "If they say X, respond with Y"
- **Red flags to watch for** — counter-manipulation detection
- **Post-engagement debrief template** — log what happened for progress tracking

---

## 3. UX Flows

### 3.1 Onboarding Flow

```
Screen 1: "What brings you to Shadow Persuasion?"
  □ I want to win more negotiations
  □ I think someone is manipulating me
  □ I want to be more persuasive in general
  □ Career advancement
  □ Dating / relationships
  □ Sales / closing deals
  [Select up to 3]

Screen 2: "What's your experience with persuasion psychology?"
  ○ Beginner — I've heard of it but haven't studied
  ○ Intermediate — I've read a book or two
  ○ Advanced — I actively use these frameworks
  → Sets initial rank + content difficulty

Screen 3: "Choose your default communication style"
  🗡️ Direct & Dominant
  🎭 Subtle & Strategic  
  😊 Warm & Charming
  🧠 Logical & Analytical
  → Can change anytime; affects all AI response suggestions

Screen 4: "Your first mission" → drops them into a quick
  role-play scenario based on their Screen 1 selection
  (2-3 exchanges, shows the product's power immediately)

Screen 5: Results + "Unlock full access" CTA
```

**Design principle:** No empty dashboard. Every new user gets an immediate "aha moment" within 60 seconds.

### 3.2 Screenshot Analysis Flow ("Decode")

```
1. User taps "Decode" (camera icon) on main nav
2. Upload options:
   - 📸 Take photo / upload from gallery
   - 📋 Paste text (fallback for desktop)
   - 📎 Upload file (email .eml, .pdf)
3. Processing screen (1-3 seconds):
   - "Analyzing conversation..."
   - "Identifying techniques..."
   - "Generating tactical responses..."
   (animated dark UI with scanning effect)
4. Results card (see output structure in §2.1)
5. Action buttons:
   - 📋 Copy response (copies selected option)
   - 💬 Discuss further (opens Coach Chat with context loaded)
   - 🗂️ Save to history
   - 🔄 Regenerate (different angle)
   - 📚 Learn more (deep-dive on detected techniques)
6. Optional: Rate the analysis (thumbs up/down + comment)
   → feeds into model improvement
```

### 3.3 Coach Chat Flow ("Strategize")

```
1. User opens "Strategize" tab
2. New conversation or continue existing thread
3. Chat interface with:
   - Message input (text + image upload inline)
   - Tone selector (persistent, shown as pill buttons above input):
     🗡️ 🎭 😊 🧠
   - Quick prompts (collapsible, shown for new conversations):
     "Analyze this situation"
     "Give me a script for..."
     "What technique should I use for..."
     "Role-play as my [boss/client/date]"
4. AI responds with structured advice:
   - Technique tags (clickable → opens knowledge base article)
   - Source citations (book + chapter, also clickable)
   - Actionable next steps (numbered)
   - Copy-paste ready scripts where applicable
5. Conversation sidebar:
   - Detected techniques used in this thread
   - XP earned
   - Related playbooks
```

### 3.4 Role-Play Flow ("Spar")

```
1. User taps "Spar"
2. Setup screen:
   - Choose scenario (from templates or "Custom")
   - If custom: describe the situation + who they're talking to
   - Set difficulty: Easy / Medium / Hard / Nightmare
   - Toggle: "Coaching sidebar" on/off
   - Toggle: "Time pressure" on/off (forces response within 60s)
3. Role-play begins:
   - Split screen: conversation on left, coaching notes on right
     (mobile: coaching notes in collapsible drawer)
   - AI's messages appear as the "other party"
   - User types their responses
   - If coaching is on: after each AI message, a brief note appears:
     "They just used [Anchoring]. Consider [Counter-Anchor] or
      [Strategic Silence]."
4. Session ends when:
   - User taps "End session"
   - AI determines the conversation reached a natural conclusion
   - 15 exchanges reached (adjustable)
5. Debrief screen:
   - Performance score (0-100)
   - Technique scorecard: which ones used, which missed
   - "Reveal Mode" toggle — see AI's internal strategy
   - Key moments replay with annotations
   - "Try again" or "Save & continue"
6. XP awarded based on performance
```

### 3.5 Playbook Flow (Template Scenarios)

```
1. User taps "Playbooks" in main nav
2. Browse by category (Career / Relationships / Sales / Social / Defense)
   or search
3. Select a playbook (e.g., "Negotiate a Raise")
4. Playbook overview screen:
   - Situation description
   - Techniques you'll learn
   - Estimated time (5-15 min)
   - Difficulty rating
   - Success rate from other users
5. "Start Playbook" →
   Phase 1: Briefing (read the context, understand the setup)
   Phase 2: Preparation (AI asks you questions to customize the scenario)
   Phase 3: Execution (guided conversation with branching paths)
   Phase 4: Debrief (what went well, what to improve)
6. Save results → added to your mastery tracking
```

### 3.6 Progress & History Flow

```
Dashboard shows:
- Current rank + XP bar to next level
- Streak counter (consecutive days active)
- Technique mastery grid:
  Each technique is a card showing mastery % (0-100)
  Color-coded: Red (<30) → Yellow (30-70) → Green (>70)
- Recent activity feed (analyses, chats, role-plays, playbooks)
- Saved conversations (searchable, filterable by category)
- Field reports log
- Weekly stats email opt-in
```

### 3.7 Field Report Flow

```
1. User taps "Log Field Report" (+ button on dashboard)
2. Form:
   - Situation type (dropdown: negotiation, sales call, date, etc.)
   - Techniques attempted (multi-select from known techniques)
   - Outcome: Win / Partial Win / Loss / Ongoing
   - What happened (free text, 2-3 sentences min)
   - Optional: upload screenshot of the real conversation
   - Mood/confidence rating (1-5)
3. AI provides brief feedback:
   - "Nice use of [Reciprocity]. Next time, consider stacking
     [Commitment/Consistency] to lock in the agreement."
4. XP awarded (bonus XP for field reports — incentivize real usage)
5. Added to personal log (private, never shared)
```

---

## 4. Template Scenarios (37 Total)

### Career (9)

| # | Scenario | Key Techniques |
|---|----------|---------------|
| 1 | **Negotiate a Raise** | Anchoring, BATNA, Reciprocity, Strategic Timing |
| 2 | **Negotiate a Job Offer** | Counter-anchoring, Package Negotiation, Silence |
| 3 | **Handle a Difficult Boss** | Frame Control, Strategic Compliance, Upward Management |
| 4 | **Get Promoted (6-Month Campaign)** | Social Proof, Authority Building, Coalition |
| 5 | **Ace a Job Interview** | Primacy/Recency, Halo Effect, Storytelling |
| 6 | **Resign Gracefully (Maximize Leverage)** | Scarcity, Future-Pacing, Bridge Burning Prevention |
| 7 | **Navigate Office Politics** | Alliance Mapping, Information Asymmetry, Strategic Disclosure |
| 8 | **Handle Being Passed Over** | Frame Reframing, Emotional Regulation, Strategic Confrontation |
| 9 | **Manage Up When Your Boss is Incompetent** | Indirect Influence, Credit Sharing, Invisible Leadership |

### Relationships (8)

| # | Scenario | Key Techniques |
|---|----------|---------------|
| 10 | **First Date: Build Attraction Fast** | Scarcity, Push-Pull, Vulnerability Loop, Cold Reading |
| 11 | **Have the "Define the Relationship" Talk** | Frame Setting, Strategic Vulnerability, Silence |
| 12 | **Set Boundaries Without Ultimatums** | Broken Record, Consequence Framing, Calm Authority |
| 13 | **Navigate a Breakup Conversation** | Frame Control, Emotional Detachment, Future-Pacing |
| 14 | **Win Back an Ex (When Strategic)** | No-Contact Scarcity, Social Proof, Indirect Approach |
| 15 | **Handle Jealousy / Possessive Partner** | Pattern Interrupt, Boundary Setting, Diagnostic Questions |
| 16 | **Navigate In-Laws / Family Politics** | Coalition Building, Triangulation Defense, Strategic Compliance |
| 17 | **Recover from a Major Fight** | De-escalation, Repair Attempts, Meta-Communication |

### Sales & Business (8)

| # | Scenario | Key Techniques |
|---|----------|---------------|
| 18 | **Close a Reluctant Client** | Fear of Missing Out, Social Proof Stack, Assumptive Close |
| 19 | **Handle "Your Price is Too High"** | Reframing, Anchoring Reset, Value Stacking |
| 20 | **Cold Outreach That Gets Replies** | Pattern Interrupt, Curiosity Gap, Reciprocity Trigger |
| 21 | **Negotiate a Contract** | BATNA, Nibbling, Red Herring Issues, Package Dealing |
| 22 | **Partnership/JV Proposal** | Mutual Gain Framing, Authority Positioning, Commitment Escalation |
| 23 | **Handle a Client Threatening to Leave** | Loss Aversion, Retention Scripting, Strategic Concession |
| 24 | **Fundraising Pitch** | Storytelling, Scarcity, Authority, Social Proof Stack |
| 25 | **Hire Top Talent (Persuade Them to Join)** | Vision Selling, Scarcity, Reciprocity, Identity Appeal |

### Social (6)

| # | Scenario | Key Techniques |
|---|----------|---------------|
| 26 | **Handle a Confrontation Without Escalating** | De-escalation, Fogging, Broken Record |
| 27 | **Build Instant Rapport with Anyone** | Mirroring, Label + Validate, Strategic Self-Disclosure |
| 28 | **Become the Authority in a Room** | Frame Control, Spatial Dominance, Strategic Speaking Patterns |
| 29 | **Navigate Group Dynamics at a Party** | Social Mapping, Coalition Entry, Status Calibration |
| 30 | **Give Feedback Without Creating an Enemy** | Sandwich (advanced), Identity-Safe Language, Future Focus |
| 31 | **Say No Without Burning Bridges** | Positive Refusal, Redirection, Reciprocity Preservation |

### Defense (6)

| # | Scenario | Key Techniques |
|---|----------|---------------|
| 32 | **Recognize You're Being Manipulated** | Red Flag Detection, Pattern Recognition, Meta-Awareness |
| 33 | **Counter Gaslighting** | Reality Anchoring, Documentation, Strategic Confrontation |
| 34 | **Spot Deception in Real-Time** | Micro-expression Awareness, Statement Analysis, Baseline Reading |
| 35 | **Protect Against Social Engineering** | Verification Protocols, Information Hygiene, Pretexting Detection |
| 36 | **Handle a Narcissist (Work or Personal)** | Grey Rock, Strategic Supply Withdrawal, Boundary Enforcement |
| 37 | **Defend Against High-Pressure Sales** | Time Expansion, Anchoring Awareness, Strategic Delay |

---

## 5. Knowledge Base Architecture

### 5.1 Source Library (25 Core Titles)

**Tier 1 — Foundational (must have for MVP):**
1. *Influence: The Psychology of Persuasion* — Robert Cialdini
2. *Pre-Suasion* — Robert Cialdini
3. *Never Split the Difference* — Chris Voss
4. *48 Laws of Power* — Robert Greene
5. *The Art of Seduction* — Robert Greene
6. *The Art of War* — Sun Tzu
7. *How to Win Friends and Influence People* — Dale Carnegie
8. *Dark Psychology 101* — Michael Pace
9. *The 33 Strategies of War* — Robert Greene
10. *Thinking, Fast and Slow* — Daniel Kahneman

**Tier 2 — Advanced:**
11. *The Laws of Human Nature* — Robert Greene
12. *Games People Play* — Eric Berne
13. *What Every BODY is Saying* — Joe Navarro
14. *The Like Switch* — Jack Schafer
15. *Crucial Conversations* — Patterson, Grenny, et al.
16. *Getting to Yes* — Fisher & Ury
17. *Start with No* — Jim Camp
18. *Mastery* — Robert Greene
19. *The Definitive Book of Body Language* — Allan & Barbara Pease
20. *Spy the Lie* — Houston, Floyd, Carnicero

**Tier 3 — Specialist:**
21. *The Sociopath Next Door* — Martha Stout (defense)
22. *In Sheep's Clothing* — George Simon (manipulation defense)
23. *Pitch Anything* — Oren Klaff (sales/framing)
24. *The Charisma Myth* — Olivia Fox Cabane
25. *Emotional Intelligence* — Daniel Goleman

### 5.2 Knowledge Base Structure

**Do NOT just dump full books into a vector DB and call it a day.** The quality of the RAG system depends entirely on how the knowledge is structured.

**Recommended approach: Structured Knowledge Graph + Vector Search hybrid**

#### Layer 1: Technique Taxonomy (Structured DB)

```
Technique {
  id: string
  name: "Anchoring"
  aliases: ["First Offer Effect", "Anchor Bias"]
  category: "Negotiation" | "Persuasion" | "Manipulation" | "Defense"
  subcategory: "Cognitive Bias Exploitation"
  difficulty: 1-5
  ethical_rating: "White" | "Grey" | "Dark"
  description: "Setting a reference point that subsequent..."
  how_it_works: "When you present a number/position first..."
  when_to_use: ["Salary negotiation", "Pricing discussion", ...]
  when_NOT_to_use: ["When you lack information", ...]
  counter_techniques: [ref: "Counter-Anchor", "Strategic Silence"]
  related_techniques: [ref: "Framing", "Priming"]
  source_frameworks: [
    { book: "Influence", author: "Cialdini", chapter: 2 },
    { book: "Never Split the Difference", author: "Voss", chapter: 4 }
  ]
  examples: [
    { situation: "...", dialogue: "...", outcome: "..." }
  ]
  practice_exercises: [...]
}
```

This gives the AI **structured retrieval** — when someone asks about a negotiation, the system pulls relevant techniques by category/situation, not just raw text similarity.

#### Layer 2: Situation Templates (Structured DB)

```
Situation {
  id: string
  name: "Salary Negotiation"
  category: "Career"
  relevant_techniques: [ref: Technique IDs]
  typical_phases: ["Preparation", "Opening", "Exploration", "Bargaining", "Closing"]
  common_mistakes: [...]
  power_dynamics: "Usually employer holds initial frame"
  key_variables: ["BATNA strength", "Market rate", "Relationship value"]
}
```

#### Layer 3: Vector Search over Book Content (RAG)

For deeper/nuanced queries, the system searches chunked book content:

**Ingestion pipeline:**
```
PDF/EPUB → Text extraction → Chapter segmentation →
Paragraph-level chunking (500-800 tokens, 100-token overlap) →
Metadata tagging (book, chapter, author, topics) →
Embedding (text-embedding-3-large) →
Vector DB (Pinecone or Qdrant)
```

**Chunking strategy:**
- Chunk by paragraph/section, NOT arbitrary token windows
- Preserve chapter and section headers as metadata
- Tag each chunk with: `book`, `author`, `chapter`, `section`, `techniques_mentioned[]`, `situation_tags[]`
- Create "summary chunks" for each chapter (AI-generated) for high-level queries

#### Layer 4: Query Pipeline

```
User query
  ↓
Intent classification → { technique_lookup | situation_advice | 
                          conversation_analysis | general_question }
  ↓
Structured retrieval (Layer 1 + 2) — pull relevant techniques/situations
  ↓
Vector search (Layer 3) — pull relevant book passages
  ↓
Merge + rank context
  ↓
LLM generation with assembled context
  ↓
Post-processing: add citations, format response, extract actionable items
```

### 5.3 Copyright Strategy

**Critical: Do NOT reproduce copyrighted text verbatim.**

- **Approach:** Transform all book content into **original knowledge articles** that synthesize concepts across sources, cite the original framework/author, and add original examples and applications
- **Legal model:** Same as what educational platforms, YouTube creators, and business coaches do — teach the concepts, cite the source, don't reproduce the text
- **RAG usage:** The vector DB stores paraphrased/synthesized content, not raw book text. Book passages are used during the *authoring* of the knowledge base, then discarded
- **Terms of service:** Include disclaimer that content is for educational purposes, cite original authors, and recommend users purchase the source books (affiliate links = additional revenue)
- **Original content creation:** Over time, create original frameworks, case studies, and technique descriptions that are proprietary to Shadow Persuasion

---

## 6. Digital Product / Course Components

### Recommendation: AI-First, Content-Light

**Don't build a course.** The market is drowning in courses. The AI tools are the product. However, structured content serves two purposes: (1) SEO/content marketing, and (2) giving users enough theory to use the AI tools effectively.

### 6.1 Knowledge Library (Written, Not Video)

Written modules — **not video**. Reasons:
- Faster to produce and iterate
- Users can search and reference
- Lower production cost
- Better for the "look it up in the moment" use case
- Video feels like homework; articles feel like Intel

**Structure:**
- **Technique Cards** — one per technique (~150 total). 500-800 words each. Includes: explanation, examples, when to use, when not to, counter-techniques, practice exercise. Viewable from any AI response that cites a technique.
- **Situation Guides** — one per template scenario (~37 total). 1,000-1,500 words. Deeper context on the psychology of that specific situation.
- **Framework Spotlights** — one per major author/framework (~10 total). Overview of the author's system, key principles, when their approach works best.

### 6.2 Progression System

**Ranks (not "courses"):**

| Rank | XP Required | Unlocks |
|------|-------------|---------|
| **Recruit** | 0 | Basic playbooks, 5 analyses/day, coach chat |
| **Operative** | 500 XP | All playbooks, 15 analyses/day, role-play easy/medium |
| **Strategist** | 2,000 XP | Role-play hard mode, advanced techniques library |
| **Architect** | 5,000 XP | Nightmare mode, technique creation, community access |
| **Shadow** | 15,000 XP | Beta features, advisory input, "Shadow" badge |

XP sources:
- Complete a playbook: 50-100 XP
- Screenshot analysis: 10 XP
- Coach chat session (5+ messages): 20 XP
- Role-play completion: 30-80 XP (scaled by difficulty + score)
- Field report: 40 XP
- Daily challenge: 25 XP
- Streak bonus: +5 XP per consecutive day (caps at +50)

**Note:** Ranks are for engagement/gamification. All AI features are available from day 1 for paying members. Ranks unlock cosmetic + community features, not core functionality. Exception: role-play difficulty modes gate behind rank to ensure users have baseline knowledge before facing "Nightmare" AI opponents.

### 6.3 Community — Phase 2, Not MVP

**Don't launch with community features.** They require moderation, critical mass, and distract from the core product. Plan for Phase 2:

- **Anonymous forum** (think Reddit-style, pseudonymous)
- **Categories:** Field Reports, Technique Discussion, Situation Advice, Success Stories
- **Peer role-play matching** (users practice with each other)
- **Leaderboards** (anonymous, opt-in)
- **No real names, no profile photos** — the "shadow" brand means privacy

---

## 7. Gamification & Engagement

### 7.1 XP & Streaks

- XP system as detailed in §6.2
- **Streak counter:** consecutive days with at least one meaningful action (analysis, chat session of 3+ messages, playbook, field report)
- **Streak milestones:** 7 days → badge, 30 days → badge + unlock, 100 days → badge + permanent XP multiplier (1.2x)
- **Streak freeze:** 1 free freeze per week (like Duolingo), additional freezes cost in-app currency

### 7.2 Technique Mastery Grid

Each of the ~150 techniques has a mastery score (0-100):
- **0-30 (Red):** Unfamiliar — has read about it but not practiced
- **30-70 (Yellow):** Practiced — has used it in role-plays, referenced in analyses
- **70-100 (Green):** Mastered — has logged successful field reports using it

Mastery increases through:
- Reading the technique card: +5 (one-time)
- Using it in a role-play where AI confirms correct usage: +10
- Referencing it in a coach chat: +3
- Logging a field report with this technique tagged: +15
- Having a high-rated field report outcome: +10

The mastery grid is the primary visual on the dashboard. It's satisfying to fill in (like a skill tree in a video game).

### 7.3 Daily Challenges

One new challenge every day at midnight user-local-time:

Examples:
- *"Use the Door-in-the-Face technique in a real conversation today. Log a field report."*
- *"Complete the 'Handle Objections' playbook."*
- *"Analyze 3 screenshots and identify at least 5 unique techniques."*
- *"Win a Hard-mode role-play as a salary negotiation."*
- *"Read 3 technique cards you haven't visited before."*

Reward: 25 XP + daily challenge badge (cosmetic)

### 7.4 Badges

~30 badges at launch, expandable:
- **First Blood** — complete first analysis
- **The Student** — read 10 technique cards
- **The Operative** — complete 10 role-plays
- **Field Agent** — log 5 field reports
- **Streak Master** — 30-day streak
- **Dark Scholar** — read all technique cards in one category
- **Unbreakable** — win 5 Nightmare-mode role-plays
- **The Architect** — reach Architect rank
- **Counter-Intelligence** — identify 50 manipulation techniques in screenshots
- **Silver Tongue** — score 90+ on 10 role-plays

### 7.5 Anonymous Leaderboards (Phase 2)

- Weekly leaderboard by XP earned (not total — so new users can compete)
- Monthly leaderboard by field report success rate
- Category leaderboards (top Career scorer, top Sales scorer, etc.)
- Fully anonymous — display rank name only

---

## 8. Monetization Strategy

### 8.1 Pricing Tiers

| | **Free (Shadow Recruit)** | **Pro ($47/mo)** | **Elite ($97/mo)** |
|---|---|---|---|
| Screenshot analyses | 3/day | Unlimited | Unlimited |
| Coach chat | 5 messages/day | Unlimited | Unlimited |
| Role-play | 1/day (Easy only) | Unlimited, all difficulties | Unlimited + priority queue |
| Playbooks | 5 free playbooks | All 37+ | All + early access to new ones |
| Technique library | 20 basic techniques | Full library (150+) | Full + exclusive advanced content |
| Field reports | View only | Full logging + AI feedback | Full + trend analytics |
| Daily challenges | ✓ | ✓ | ✓ |
| Gamification | Basic | Full | Full + exclusive badges |
| Response tones | 1 (default) | All 4 | All 4 + custom persona creation |
| History/saved | Last 3 | Unlimited | Unlimited + export |
| Community | — | Read access | Full access + mentor status |
| Priority support | — | — | ✓ |

### 8.2 Why $47/mo Works

- **Higher than a "tool" ($9-19)** → positions as premium coaching, not commodity
- **Lower than actual coaching ($200+/hr)** → massive value gap
- **Monthly recurring** → predictable revenue
- **Not annual-locked** → lower barrier, users stay because of value not sunk cost
- $47 is also a classic direct-response price point that converts well

### 8.3 Upsells & Additional Revenue

1. **Elite tier ($97/mo)** — for power users who want custom personas + analytics
2. **1-on-1 AI coaching sessions ($197 one-time)** — 60-minute deep-dive on a specific situation with extended AI analysis + a written strategy document emailed afterward. (This is still AI-powered, not human coaching — but positioned as premium with more thorough output.)
3. **Enterprise/Team plan ($297/mo for 5 seats)** — sales teams, negotiation teams. Includes team analytics dashboard showing technique adoption.
4. **Affiliate revenue** — recommend source books with Amazon affiliate links. Every technique card links to the book. At scale, this is meaningful passive income.
5. **Premium scenario packs ($19 one-time)** — seasonal or niche scenario bundles (e.g., "Real Estate Negotiation Pack," "Fundraising Pack," "Dating Mastery Pack" with 5-8 additional scenarios each)

### 8.4 Free Tier Strategy

The free tier exists to:
1. Let users experience the "aha moment" (first screenshot analysis is magic)
2. Build habit (daily challenges work even on free)
3. Create upgrade pressure (hitting the 3/day limit when you're in the middle of a real situation is painful — that's when conversion happens)

**Do NOT gate the entire product behind a paywall with no free trial.** The screenshot analysis feature is the viral hook — someone tries it, shows a friend, friend signs up. Gating it kills virality.

---

## 9. Technical Architecture

### 9.1 Frontend

**Framework: Next.js 14+ (App Router) with Tailwind CSS + shadcn/ui**

Why:
- SSR for SEO (knowledge library pages need to rank)
- App Router for the dashboard SPA experience
- shadcn/ui gives polished, accessible components without framework lock-in
- Tailwind for rapid dark-themed UI development

**Key UI characteristics:**
- Dark theme (default and only option — fits the brand)
- Accent color: deep purple (#7C3AED) + electric blue (#3B82F6)
- Typography: Inter for body, JetBrains Mono for technique names/codes
- Smooth micro-animations (Framer Motion) — the "scanning" effect on screenshot analysis, typing indicators on coach chat
- Mobile-first — this is a tool people use on their phone right before/during conversations

**Key pages/routes:**
```
/ → Landing page (marketing)
/app → Dashboard (requires auth)
/app/decode → Screenshot analysis
/app/strategize → Coach chat
/app/spar → Role-play
/app/playbooks → Template scenarios
/app/playbooks/[id] → Individual playbook
/app/library → Technique library
/app/library/[technique] → Individual technique card
/app/progress → XP, mastery grid, badges, history
/app/field-reports → Field report log
/app/settings → Account, preferences, billing
/blog → SEO content (SSR)
```

### 9.2 Backend

**Framework: Next.js API Routes + separate Python FastAPI service for AI**

**Why two services:**
- Next.js API routes handle auth, CRUD, payments, user data — standard web app stuff
- Python FastAPI handles AI inference, RAG pipeline, image processing — Python ecosystem is vastly superior for AI/ML
- They communicate via internal API calls

**Auth: Clerk**
- Fastest to implement, handles social login, magic links, session management
- $25/mo at scale — worth it vs. building auth

**Payments: Stripe**
- Subscriptions via Stripe Billing
- Checkout via Stripe Checkout (hosted) for MVP
- Webhook handler for subscription lifecycle events
- Customer portal for self-serve billing management

**API structure (Next.js):**
```
POST   /api/decode          → Screenshot analysis request
GET    /api/decode/[id]     → Get analysis result
POST   /api/chat            → Coach chat message
GET    /api/chat/sessions   → List chat sessions
GET    /api/chat/[id]       → Get chat session
POST   /api/spar            → Start role-play
POST   /api/spar/[id]/turn  → Submit role-play turn
POST   /api/spar/[id]/end   → End role-play + get debrief
GET    /api/playbooks        → List playbooks
GET    /api/playbooks/[id]   → Get playbook content
POST   /api/playbooks/[id]/start → Start playbook session
POST   /api/field-reports    → Create field report
GET    /api/field-reports    → List field reports
GET    /api/progress         → Get user progress (XP, mastery, badges)
GET    /api/library          → Technique library (with search/filter)
GET    /api/library/[id]     → Individual technique
POST   /api/billing/checkout → Create Stripe checkout session
POST   /api/billing/portal   → Create Stripe portal session
POST   /api/webhooks/stripe  → Stripe webhook handler
```

**API structure (FastAPI AI service):**
```
POST   /ai/analyze-image     → Vision analysis of screenshot
POST   /ai/chat              → RAG-augmented chat completion
POST   /ai/roleplay          → Role-play turn generation
POST   /ai/debrief           → Post-session analysis
POST   /ai/field-report      → Field report feedback generation
GET    /ai/health             → Health check
```

### 9.3 AI Pipeline

**Primary model: Claude 3.5 Sonnet (Anthropic) or GPT-4o (OpenAI)**

Recommendation: **Claude 3.5 Sonnet** for all text generation. Reasons:
- Better at nuanced social/psychological analysis
- Better at following complex system prompts (which this product needs heavily)
- Cheaper than GPT-4o at comparable quality
- Less likely to refuse "dark psychology" content with proper system prompt framing

**Vision model: GPT-4o or Claude 3.5 Sonnet (both have vision)**
- For screenshot analysis — needs to parse conversation UIs
- Claude's vision is good enough; staying single-provider simplifies architecture

**Embeddings: OpenAI text-embedding-3-large**
- Best quality embeddings available for RAG
- 3072 dimensions, can truncate to 1024 for cost savings with minimal quality loss

**Vector DB: Pinecone (serverless)**
- Managed, no infra to maintain
- Serverless tier is cost-effective at early scale
- Metadata filtering (by book, category, technique) is excellent

**RAG Pipeline (per request):**
```
1. User input (text or image)
   ↓
2. If image: Vision model extracts conversation text + context
   ↓
3. Intent classification (fast LLM call or rule-based):
   → technique_query | situation_advice | conversation_analysis | roleplay | general
   ↓
4. Structured retrieval:
   → Query Postgres for relevant techniques by category/situation tags
   → Pull technique cards, situation templates
   ↓
5. Vector retrieval:
   → Generate embedding of user query
   → Search Pinecone with metadata filters (category, relevance)
   → Retrieve top 5-8 chunks
   ↓
6. Context assembly:
   → System prompt (persona + instructions + format)
   → Structured context (technique cards, situation templates)
   → Vector context (relevant book passages)
   → Conversation history (last 10 messages)
   → User query
   ↓
7. LLM generation (Claude 3.5 Sonnet)
   ↓
8. Post-processing:
   → Extract technique references → link to library
   → Extract book citations → format
   → Structure into response format (sections, action items)
   → Log for analytics
```

**System prompt structure (critical — this is where the product's personality lives):**

```
You are Shadow, an expert tactical advisor specializing in 
influence psychology, persuasion, negotiation, and interpersonal 
dynamics. You draw from established frameworks by Cialdini, Greene, 
Voss, Carnegie, Kahneman, and other researchers.

Your role is to:
1. Analyze situations through the lens of psychological influence
2. Identify techniques being used (by or against the user)
3. Recommend specific, actionable tactical responses
4. Always ground advice in established frameworks with citations
5. Provide multiple response options when appropriate, 
   calibrated to the user's chosen communication style

Communication style for this user: {user.tone_preference}
Current context: {session.context_type}

Rules:
- Be direct and tactical. No hedging, no disclaimers about 
  "ethical considerations" — the user is an adult making their 
  own decisions.
- Always cite the specific framework/book when recommending 
  a technique.
- When analyzing a conversation, identify EVERY technique being 
  used and who is using it.
- When suggesting responses, provide the EXACT words to use, 
  not vague advice.
- Format responses with clear structure: headers, bullet points, 
  numbered steps.
```

### 9.4 Database

**Primary DB: PostgreSQL (via Supabase or Neon)**

Tables:
```sql
users (id, email, clerk_id, stripe_customer_id, plan, rank, xp, 
       streak_count, streak_last_date, tone_preference, 
       created_at, updated_at)

analyses (id, user_id, type, image_url, input_text, 
          ai_response, techniques_detected[], 
          created_at)

chat_sessions (id, user_id, title, context_type, 
               created_at, updated_at)

chat_messages (id, session_id, role, content, 
               techniques_referenced[], created_at)

roleplay_sessions (id, user_id, scenario_id, difficulty, 
                   coaching_enabled, score, status, 
                   created_at, completed_at)

roleplay_turns (id, session_id, role, content, 
                coaching_note, turn_number, created_at)

playbook_progress (id, user_id, playbook_id, status, 
                   current_phase, score, started_at, 
                   completed_at)

field_reports (id, user_id, situation_type, 
              techniques_used[], outcome, description, 
              ai_feedback, xp_awarded, created_at)

technique_mastery (id, user_id, technique_id, score, 
                   last_practiced, practice_count)

badges (id, user_id, badge_type, earned_at)

daily_challenges (id, date, challenge_type, description, 
                  xp_reward)

user_challenges (id, user_id, challenge_id, status, 
                 completed_at)
```

**File storage: Cloudflare R2 or AWS S3**
- Screenshot uploads
- Processed images

**Cache: Redis (Upstash)**
- Rate limiting (free tier usage tracking)
- Session caching
- Frequently accessed technique cards

### 9.5 Infrastructure

**Hosting:**
- Frontend + Next.js API: **Vercel** (easiest deployment, edge functions for global performance)
- AI service: **Railway** or **Render** (Python FastAPI, easy to deploy, auto-scaling)
- Alternative: everything on a single **VPS (Hetzner)** with Docker Compose if cost is a priority

**Cost estimate at launch (first 100 users):**
```
Vercel Pro:               $20/mo
Railway (AI service):     $20/mo
Supabase (Postgres):      $25/mo (Pro)
Pinecone (serverless):    $0-70/mo (usage-based)
Clerk (auth):             $25/mo
Upstash (Redis):          $10/mo
Cloudflare R2:            $5/mo
Claude API:               $200-500/mo (usage-dependent)
Stripe fees:              2.9% + $0.30 per transaction
Domain + email:           $15/mo
────────────────────────────────────
TOTAL:                    ~$350-700/mo
```

At 100 paying users × $47 = $4,700/mo revenue → healthy margin from day 1.

**Cost at 1,000 users:**
Primary cost driver is AI API usage. Estimate ~$0.15-0.30 per active user per day in API costs. At 1,000 users with 60% daily active: ~$90-180/day → $2,700-5,400/mo in AI costs. Still profitable at $47,000/mo revenue.

---

## 10. Competitive Analysis

### 10.1 Existing Products

| Product | What It Does | Price | Weakness |
|---------|-------------|-------|----------|
| **ChatGPT / Claude (generic)** | General AI, can discuss psychology | $20/mo | No specialized knowledge, no screenshots, generic advice, often refuses "manipulation" topics |
| **Yoodli** | AI speech coach | $20/mo | Presentation-focused, not persuasion/influence |
| **Poised** | Communication coach for meetings | $20/mo | Real-time meeting analysis only, no dark psychology |
| **Charm** | Texting assistant for dating | Free-$15/mo | Dating only, surface-level, no psychological frameworks |
| **TextGod** | Dating text coach | $30/mo | Dating only, template-based, not AI-powered |
| **Negotiation courses (Udemy, etc.)** | Video courses | $20-200 one-time | Passive learning, no real-time application |
| **Jordan Harbinger / influence podcasts** | Free content | Free | No personalization, no real-time advice |

### 10.2 Shadow Persuasion's Differentiators

1. **Screenshot analysis** — nobody else does this. Upload a real conversation, get real-time tactical analysis. This is the killer feature.
2. **Grounded in frameworks** — every recommendation cites a specific book/technique. Users learn the "why" not just the "what."
3. **Multi-domain** — career, relationships, sales, social, defense. Not siloed into one use case.
4. **Active, not passive** — this isn't a course you take and forget. It's a tool you use in real situations, in real time.
5. **Dark theme / dark psychology brand** — edgy positioning that appeals to the target market. The aesthetic itself is a differentiator.
6. **Practice mode (Spar)** — no competitor offers AI-powered role-play for psychological influence scenarios.

### 10.3 Positioning Statement

*"Shadow Persuasion is the world's first AI-powered influence advisor. Upload any conversation and get an instant tactical breakdown of the psychology at play — with specific, framework-backed responses you can use immediately. Powered by 25+ books on influence, persuasion, and dark psychology. For professionals who refuse to play at a disadvantage."*

**Brand tone:** Competent, direct, slightly dangerous. Think "special ops briefing" not "self-help seminar." The UI should feel like a tactical HUD, not a friendly chatbot.

---

## 11. MVP vs Full Product Roadmap

### Phase 1: MVP (Weeks 1-4)

**Goal: Validate the core value prop with paying users.**

**Build:**
- ✅ Landing page with waitlist / direct signup
- ✅ Auth (Clerk)
- ✅ Payments (Stripe, single $47/mo plan)
- ✅ Screenshot analysis ("Decode") — the hero feature
- ✅ Coach chat ("Strategize") — basic RAG-powered chat
- ✅ 10 technique cards (top 10 most referenced techniques)
- ✅ 5 playbooks (1 per category)
- ✅ Basic dashboard with history
- ✅ Mobile-responsive dark UI

**Skip for MVP:**
- ❌ Role-play (Spar)
- ❌ Gamification (XP, badges, streaks)
- ❌ Full technique library
- ❌ Field reports
- ❌ Community
- ❌ Free tier (launch as paid-only with 7-day money-back guarantee)
- ❌ Elite tier

**Knowledge base for MVP:**
- Manually create 10 structured technique cards
- Ingest 5 core books into RAG (Cialdini, Voss, Greene 48 Laws, Carnegie, Kahneman)
- This is enough for high-quality responses across most scenarios

**Launch strategy:**
- Soft launch to 50-100 users from Twitter/X, Reddit (r/negotiation, r/sales, r/socialskills), and relevant communities
- Price at $47/mo from day 1 — no discounts, no "founding member" pricing (creates wrong anchor)
- Offer 7-day money-back guarantee instead of free trial

### Phase 2: Engagement & Retention (Months 2-3)

**Goal: Reduce churn, increase daily usage, build habit loops.**

**Build:**
- ✅ Role-play simulator ("Spar") — Easy and Medium difficulty
- ✅ XP system + rank progression
- ✅ Streak tracking + daily challenges
- ✅ Full technique library (150 cards)
- ✅ Technique mastery grid
- ✅ All 37+ playbooks
- ✅ Field reports with AI feedback
- ✅ Badge system (15 badges)
- ✅ Free tier (3 analyses/day) to drive top-of-funnel
- ✅ Ingest remaining 20 books into knowledge base
- ✅ Email sequences: onboarding (7-day), re-engagement, weekly digest

**Optimizations:**
- Analyze usage data: which features drive retention?
- A/B test system prompts for response quality
- Optimize RAG pipeline based on user feedback

### Phase 3: Full Vision (Months 4-8)

**Goal: Maximize LTV, expand market, build moat.**

**Build:**
- ✅ Hard + Nightmare role-play difficulty
- ✅ Custom persona creation (Elite tier)
- ✅ Elite tier ($97/mo) launch
- ✅ Community forum (anonymous)
- ✅ Peer role-play matching
- ✅ Leaderboards
- ✅ Premium scenario packs ($19 upsells)
- ✅ Enterprise/team plan ($297/mo)
- ✅ API for developers/coaches who want to embed
- ✅ Mobile app (React Native wrapper or PWA)
- ✅ Chrome extension: right-click any text on screen → "Analyze with Shadow"
- ✅ Advanced analytics: technique effectiveness tracking across all users (anonymized)
- ✅ AI model fine-tuning on user interaction data (with consent)
- ✅ Affiliate program for influencers/coaches
- ✅ Original content: Shadow Persuasion's own frameworks (proprietary IP)

### Key Metrics to Track

| Metric | Target (Month 1) | Target (Month 6) |
|--------|-------------------|-------------------|
| Paying users | 100 | 1,000 |
| MRR | $4,700 | $50,000+ |
| DAU/MAU ratio | 30% | 40% |
| Analyses per user/day | 2 | 3 |
| Monthly churn | <15% | <8% |
| 7-day retention | 50% | 65% |
| Average sessions/week | 3 | 5 |
| NPS | 30+ | 50+ |

---

## Appendix A: Feature Priority Matrix

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| Screenshot analysis | 🔴 Critical | Medium | **P0 — MVP** |
| Coach chat (RAG) | 🔴 Critical | Medium | **P0 — MVP** |
| Auth + Payments | 🔴 Critical | Low | **P0 — MVP** |
| Landing page | 🔴 Critical | Low | **P0 — MVP** |
| Playbooks (5) | 🟡 High | Low | **P0 — MVP** |
| Technique cards (10) | 🟡 High | Low | **P0 — MVP** |
| Role-play simulator | 🟡 High | High | **P1 — Phase 2** |
| XP / Gamification | 🟡 High | Medium | **P1 — Phase 2** |
| Full technique library | 🟢 Medium | Medium | **P1 — Phase 2** |
| All playbooks (37) | 🟢 Medium | Medium | **P1 — Phase 2** |
| Field reports | 🟢 Medium | Low | **P1 — Phase 2** |
| Free tier | 🟡 High | Low | **P1 — Phase 2** |
| Daily challenges | 🟢 Medium | Low | **P1 — Phase 2** |
| Badges | 🟢 Medium | Low | **P1 — Phase 2** |
| Community | 🟢 Medium | High | **P2 — Phase 3** |
| Elite tier | 🟢 Medium | Medium | **P2 — Phase 3** |
| Enterprise plan | 🟢 Medium | High | **P2 — Phase 3** |
| Chrome extension | 🟢 Medium | Medium | **P2 — Phase 3** |
| Mobile app | 🟡 High | High | **P2 — Phase 3** |
| Custom personas | 🟢 Medium | Medium | **P2 — Phase 3** |
| Peer role-play | 🔵 Low | High | **P3 — Future** |
| API | 🔵 Low | High | **P3 — Future** |

---

## Appendix B: Risk Factors

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| **AI model refuses "dark psychology" prompts** | Medium | Careful system prompt engineering; frame as "educational, ethical persuasion psychology." Use Claude (more permissive with proper framing). Have fallback prompts. Test extensively before launch. |
| **Copyright claims from book authors** | Low | Never reproduce text verbatim. Synthesize into original content. Cite sources. Include affiliate links (authors benefit). Consult IP lawyer for $500 peace of mind. |
| **High churn (>15% monthly)** | Medium | Gamification, daily challenges, streak mechanics, field reports. Make the product a daily habit, not a one-time tool. |
| **AI cost exceeds revenue** | Low | Rate limit free tier aggressively. Use caching for common queries. Use cheaper models (Claude Haiku) for intent classification and simple tasks. Reserve Sonnet for generation. |
| **Ethical/PR backlash ("manipulation tool")** | Medium | Position as "influence education" and "manipulation defense." Prominent defense category. Disclaimer page. The books we cite are all bestsellers — this is the same content in a better format. |
| **Platform risk (Stripe/Clerk TOS)** | Low | The product is educational. It's not facilitating harm. Thousands of courses teach this content. Review TOS carefully but this is low risk. |

---

*End of specification. Ready for build.*
