# Shadow Persuasion — Complete UX/UI Specification

**Version:** 1.0  
**Date:** 2026-03-27  
**Product:** AI-powered dark psychology coaching platform ($47/mo SaaS)

---

## Design Philosophy

Shadow Persuasion is NOT a generic SaaS dashboard with a dark skin. It's an **operator's command center** — the feeling of accessing classified intelligence, but with the usability of a modern AI tool. Every interaction should make the user feel like they've gained access to something most people don't have.

**Three design pillars:**
1. **Intelligence Aesthetic** — Declassified documents, redacted text, dossier folders, briefing formats. But restrained — it's a *flavor*, not a costume.
2. **Operator Efficiency** — Zero friction to the core action. A user with a screenshot of a manipulative text should go from app-open to counter-response in under 30 seconds.
3. **Progressive Mastery** — The interface reveals depth as the user grows. Day-1 users see clean, guided flows. Month-3 users have keyboard shortcuts, custom scenario builders, and technique layering.

---

## 1. Onboarding Flow

### Step 1: Sign-Up (Single Screen)
- Email + password OR Google OAuth. Nothing else.
- Background: slow-scrolling redacted document texture (subtle, not distracting)
- CTA button: **"Request Access"** (not "Sign Up" — language matters)
- Below button: "Your clearance level: PENDING" in monospace, olive-drab text
- After submit: brief 1.5s animation of a "CLEARANCE GRANTED" stamp effect, then redirect

### Step 2: Operator Profile — The Intake (4 screens, progress bar at top)

**Screen 2a: "What's Your Operating Theater?"**
- Single-select cards, large tap targets, each with an icon and one-line description:
  - 🏢 **Career & Corporate** — Office politics, negotiations, promotions, leadership
  - 💬 **Relationships** — Dating, boundaries, family dynamics, social circles
  - 💰 **Sales & Business** — Closing deals, client management, pricing psychology
  - 🛡️ **Defense** — Recognize manipulation, protect yourself, set boundaries
  - 🌐 **Social Dynamics** — Group influence, networking, status, charisma
- User picks 1-2 primary. This drives dashboard personalization.

**Screen 2b: "What's Your Experience Level?"**
- Three options, styled as clearance levels:
  - **LEVEL 1 — CIVILIAN** — "I'm new to influence psychology. Start from basics."
  - **LEVEL 2 — FIELD AGENT** — "I've read some books. I know the basics but want tactical application."
  - **LEVEL 3 — OPERATOR** — "I'm experienced. Give me advanced techniques and skip the intro."
- This sets tutorial depth, scenario difficulty defaults, and content complexity.

**Screen 2c: "Current Situation Briefing" (optional but encouraged)**
- Text area: "Describe a situation you're currently navigating. This helps your AI coach give relevant advice from day one."
- Placeholder text: *"e.g., My manager takes credit for my work and I need to shift the power dynamic without creating conflict..."*
- Character limit: 500. Below: "This is encrypted and private. Your coach sees it. Nobody else."
- Skip button available but muted/secondary.

**Screen 2d: "Your Operator Profile"**
- Generated summary card (like a dossier):
  - Codename: auto-generated (e.g., "OPERATOR-7741") — user can customize later
  - Primary Theater: [their selection]
  - Clearance: [their level]
  - Current Mission: [brief AI summary of their situation, or "Awaiting briefing" if skipped]
- Big CTA: **"Enter Command Center"**

### Step 3: First-Run Tutorial (contextual, not a slideshow)

NO modal tutorial slides. Instead: the user lands on the dashboard with 4 pulsing hotspots (subtle glow, not obnoxious tooltips). Each hotspot has a number (1-4). Clicking reveals a 2-sentence explanation + "Try it" button.

1. **Screenshot Analyzer** — "Upload any conversation screenshot. We'll decode the psychology behind it." → Try it: opens upload modal with a sample screenshot pre-loaded
2. **AI Coach** — "Your personal influence strategist. Describe any situation, get tactical advice." → Try it: opens chat with their intake situation pre-loaded as context
3. **Scenarios** — "Practice real situations in a safe environment. AI plays the other party." → Try it: opens a beginner scenario in their primary theater
4. **Knowledge Base** — "Every technique, explained with examples. Your reference library." → Try it: opens a technique relevant to their intake situation

Hotspots dismiss after interaction. A "Show tutorial" link in settings brings them back.

### Step 4: First Mission

After the user completes ANY one tutorial hotspot, a notification slides in from the right:

> **MISSION BRIEFING — Operation First Contact**  
> Complete your first full scenario to unlock your Operator Dashboard.  
> Estimated time: 5 minutes.  
> [Accept Mission]

This is a curated beginner scenario in their chosen theater. It walks them through:
1. Reading the situation brief (30 sec)
2. Choosing an approach (15 sec)
3. 4-turn role-play with the AI counterpart (2-3 min)
4. Debrief screen showing techniques they naturally used and ones they missed (1 min)

After completion: "MISSION COMPLETE" stamp animation. Dashboard fully unlocks.

---

## 2. Dashboard / Home Screen

### Layout (Desktop)

The dashboard is a **single-scroll vertical layout** with a persistent left sidebar. No cards-on-cards-on-cards SaaS soup.

**Left Sidebar (240px, collapsible to 64px icons-only):**
- Top: Shadow Persuasion logo (small, monochrome)
- User avatar + codename
- Nav items (icons + labels):
  - 📊 Command Center (dashboard)
  - 📸 Screenshot Analyzer
  - 💬 AI Coach
  - 🎯 Scenarios
  - ⚔️ Role-Play Simulator
  - 📚 Knowledge Library
  - 📈 Progress
  - ⚙️ Settings
- Bottom: "Field Report" quick-add button (always accessible)
- Sidebar background: `#0D0F12` with a very faint vertical line pattern (like ruled paper in a notebook)

**Main Content Area:**

**Section 1: Mission Briefing Banner (top, full-width, ~120px tall)**
- Dark card with a subtle "TOP SECRET" watermark at 5% opacity
- Left side: Today's date in military format (27 MAR 2026), greeting: "Good evening, Operator."
- Right side: Daily Mission card
  - Title: e.g., "Practice the Door-in-the-Face technique"
  - One-line description
  - Difficulty badge (⚡ Easy / ⚡⚡ Medium / ⚡⚡⚡ Hard)
  - [Accept] button
  - Streak counter: "🔥 12-day streak"

**Section 2: Quick Actions Bar (~80px, 4 large buttons in a row)**
- 📸 **Analyze Screenshot** — opens upload modal
- 💬 **New Chat** — opens AI Coach with fresh context
- ⚔️ **Quick Role-Play** — random scenario in their theater, starts immediately
- 📝 **Field Report** — log a real-world result

These are the 4 things users do most. They should be reachable in ONE click from anywhere.

**Section 3: Active Operations (if any ongoing chats/scenarios)**
- Horizontal scroll of cards showing:
  - Chat/scenario title
  - Last message preview
  - Time since last activity
  - "Resume" button
- If no active operations: this section collapses and doesn't show

**Section 4: Threat Radar (two-column layout)**

Left column (60%): **Trending Techniques**
- 3-4 technique cards relevant to user's theater
- Each card: technique name, one-line summary, "Learn More" and "Practice" buttons
- Rotates daily based on what's trending in the user's category (derived from aggregate anonymized usage patterns)
- Header: "INTELLIGENCE BRIEFING — [date]"

Right column (40%): **Your Stats Snapshot**
- Radar chart (small, ~200px) showing proficiency across 6 categories
- Below: 3 key numbers:
  - Techniques mastered: X/Y
  - Sessions this week: N
  - Current streak: N days
- "Full Report →" link

**Section 5: Recent Activity Feed**
- Compact list (not cards) of last 5 actions:
  - "Analyzed screenshot — 3 techniques detected" [2h ago]
  - "Completed scenario: Salary Negotiation" [yesterday]
  - "AI Coach session — 12 messages" [yesterday]
- Each row clickable to resume/review

### Classified-Document Theme — How It Works Functionally

The theme is applied through **texture, typography, and micro-details**, not through making things hard to read:

- **Section headers** use a stencil-style font (like `Black Ops One` or `Special Elite`) at small sizes, ALL CAPS, with letter-spacing: 0.15em. Body text is a clean sans-serif (Inter or IBM Plex Sans).
- **Cards** have a barely-visible paper texture overlay (3-5% opacity) and a slight warm tint to the background (`#13151A` instead of pure dark)
- **Dividers** between sections are dashed lines (like cut-here marks on forms) instead of solid lines
- **Labels and metadata** appear in monospace (`IBM Plex Mono`) in muted olive/amber tones
- **"Classified" stamps and watermarks** appear ONLY on decorative elements (empty states, loading screens, achievement badges) — never on functional UI
- **Redacted text effect** used sparingly: on the marketing site's pricing page, on locked premium features, on "classified" future feature teasers

---

## 3. Screenshot Analyzer — Full UX Flow

### 3a: Upload Interface

**Trigger:** Click "Analyze Screenshot" from dashboard, sidebar, or keyboard shortcut `Cmd+U` / `Ctrl+U`

**Modal overlay** (not a new page — keep context):
- Dark modal, 600px wide on desktop, full-screen on mobile
- Center: large drop zone (dashed border, `#2A2D35` background)
  - Icon: crosshair/scan icon
  - Text: "Drop image here or click to browse"
  - Below: "📋 Paste from clipboard" button | "📷 Camera" button (mobile only)
- Below drop zone: "Supported: Screenshots, photos of text, chat exports (PNG, JPG, WEBP)"
- **No file size warnings until they actually hit a limit.** Don't scare them.
- On paste: `Ctrl+V` anywhere in the modal works. Image appears instantly in preview.
- On camera (mobile): opens native camera in document mode. Auto-crops to text area.

**Preview state** (after image selected):
- Image thumbnail (left, 40%)
- Right side:
  - "What's the context?" text field (optional) — placeholder: *"e.g., This is from my boss after I asked for a raise"*
  - "What do you want to know?" quick-select chips:
    - 🔍 Identify techniques used
    - ⚖️ Power dynamics analysis
    - 💬 Generate counter-response
    - 🛡️ How to defend against this
    - (All selected by default, user can deselect)
  - [Analyze] button (primary, large)

### 3b: Processing State

**Duration target:** 3-8 seconds for analysis.

**Animation:** The uploaded image slides to center-left of the screen. A scanning line (thin, amber/green, like a document scanner) sweeps vertically across the image, twice. On the right side, text appears line-by-line in monospace, like a terminal readout:

```
INITIATING ANALYSIS...
SCANNING COMMUNICATION PATTERNS... ██████░░ 75%
CROSS-REFERENCING TECHNIQUE DATABASE...
IDENTIFYING POWER DYNAMICS...
ANALYSIS COMPLETE — 4 TECHNIQUES DETECTED
```

This is theatrical but FAST. The animation is purely cosmetic — the AI is already processing. If the AI finishes before the animation, the animation speeds up. Never make users wait for an animation.

### 3c: Results Screen (Full page, replaces modal)

**Layout — Desktop (three-column):**

**Left column (45%): Annotated Screenshot**
- The original screenshot with colored overlay boxes around identified techniques
- Each box has a small numbered label (①②③④) in a colored circle
- Colors correspond to technique categories (red = manipulation, blue = persuasion, green = rapport-building, yellow = pressure tactics)
- Hover over a box: tooltip with technique name
- Click a box: scrolls to that technique's detail in the center column

**Center column (35%): Analysis Report**
- Styled like a dossier/briefing document
- Header: "ANALYSIS REPORT — [timestamp]"

- **Power Dynamics Score:** Visual meter from "You're in control" (green, left) to "They're in control" (red, right). Needle position + numeric score (1-10). Below: one-sentence explanation.

- **Techniques Identified:** (numbered list matching annotations)
  1. **[Technique Name]** — Category badge
     - What they did: 1-2 sentences
     - Why it works: 1 sentence (with source citation, e.g., "Cialdini, Ch. 3")
     - Severity: Low / Medium / High (colored dot)
  2. [Next technique...]

- **Overall Assessment:** 2-3 sentence paragraph summarizing the dynamic

**Right column (20%): Actions Panel (sticky)**
- **Generate Counter-Response** [Primary CTA button]
- **Practice This Scenario** → opens role-play with this context pre-loaded
- **Save to Dossier** → saves to history
- **Share Analysis** → generates a shareable link (anonymized, screenshot blurred by default)
- **Start Coach Chat** → opens AI Coach with this analysis as context

### 3d: Counter-Response Flow

Clicking "Generate Counter-Response" expands the right column (or opens below on mobile):

- AI generates 3 response options:
  1. **Assertive** — Direct, firm, sets clear boundaries
  2. **Strategic** — Subtle, redirects the dynamic without confrontation
  3. **Diplomatic** — Warm but firm, maintains relationship while shifting power

- Each response shown in a card with:
  - The full text of the suggested response
  - Technique tags below (e.g., "Uses: Broken Record, Fogging")
  - **[Copy]** button (copies text to clipboard, shows ✓ for 2 seconds)
  - **[Edit]** button (makes text editable inline, with "Save" and "Cancel")
  - **[Adjust]** dropdown: "More assertive" / "Softer" / "Shorter" / "Add humor" / "More formal" — selecting regenerates just that option

- Below all 3: "Generate a completely different approach" link

### 3e: History

Every analysis auto-saves. Accessible from sidebar → Screenshot Analyzer → History tab.
- Grid of thumbnail cards, sorted by date
- Each card: thumbnail, date, technique count, power dynamics score badge
- Click to re-open the full analysis
- Bulk delete, search by date range or technique type

---

## 4. AI Coach Chat — Full UX Flow

### 4a: New Chat — Context Setting

When user clicks "New Chat" (from dashboard or sidebar):

**Step 1: Context Panel (left side of chat, 320px on desktop, separate screen on mobile)**

- **Situation Type** — dropdown or chips: Career | Relationship | Sales | Social | Defense | Other
- **Describe the Situation** — text area (expandable, 3-line default)
  - Placeholder: *"What's happening? Who's involved? What's the dynamic?"*
- **Your Goal** — text area (2-line default)
  - Placeholder: *"What outcome do you want?"*
- **Attach Screenshot** (optional) — drag/drop zone, small
- **[Start Briefing]** button

This context persists as a pinned card at the top of the chat. User can edit it mid-conversation by clicking the card.

Alternatively: "Skip context — just chat" link for experienced users who want freeform.

### 4b: Chat Interface

**Desktop Layout:**
- Left: Chat area (65% width)
- Right: Technique sidebar (35% width, collapsible)

**Chat Area:**
- Messages alternate: user (right-aligned, `#1E3A5F` background) and AI coach (left-aligned, `#1A1D24` background)
- AI coach avatar: stylized silhouette icon, not a face. No fake "friendly AI" persona.
- AI coach name displayed as: **"HANDLER"** (not "AI Assistant" or "Coach")

**AI Response Format:**
- Main advice text (clean, readable paragraphs)
- **Technique Tags** inline: when a technique is mentioned, it appears as a pill/chip (e.g., `[Anchoring]` `[Mirroring]`). Hovering shows a tooltip: technique name, one-line definition, source. Clicking opens the full Knowledge Library entry in a slide-over panel (doesn't leave the chat).
- **Source Citations** appear as superscript numbers. Hovering shows: book title, author, chapter. Clicking opens the relevant book summary.
- **Suggested Next Actions** appear below each AI message as ghost buttons:
  - "Simulate their response" — AI shows what the other party might say
  - "Make it more assertive" — regenerates with a more aggressive angle
  - "Softer approach" — regenerates with a more diplomatic angle
  - "What if they say [X]?" — opens a branching path
  - "Role-play this" — opens the role-play simulator with current context

**Conversation Branching:**
- When user clicks "What if they say [X]?" or "Try a different approach", the chat **forks**
- A branch indicator appears: "Branch A: Assertive approach" with a toggle to switch to "Branch B: Diplomatic approach"
- Branches are visualized as tabs above the chat, max 3 active branches
- User can compare branches side-by-side (desktop only: splits chat area into two columns)

### 4c: Technique Sidebar (Desktop Only)

**Right panel, always visible during chat:**

- **Active Techniques** — list of all techniques mentioned in the current conversation, with:
  - Technique name
  - Times referenced in this chat
  - User's mastery level (Novice/Intermediate/Advanced/Expert)
  - Quick "Practice" button → opens a micro-scenario for that technique

- **Suggested Techniques** — AI suggests 2-3 techniques not yet discussed that might apply to the user's situation

- **Situation Summary** — AI-maintained summary of the current situation, updated as new info comes in. Always visible so the AI coach doesn't lose context.

### 4d: Chat Features

- **Voice Input** — microphone button next to text input. Transcribes and sends. Good for mobile, for when users are describing situations on the go.
- **Screenshot Drop** — drag a screenshot directly into the chat. AI analyzes it in-context.
- **"What would [persona] do?"** — dropdown in the input area. Select a persona (The Closer, The Diplomat, The Strategist, etc.) and the AI coach adopts that communication style for the next response.
- **Session Summary** — button at top of chat. Generates a bullet-point summary of all advice given, techniques discussed, and action items. Copyable.
- **Export** — download conversation as PDF (styled like a briefing document) or plain text.

---

## 5. Template Scenarios — Full UX Flow

### 5a: Scenario Selection

**Page: /scenarios**

**Top: Filter Bar**
- Category pills (horizontal scroll on mobile): All | Career | Relationships | Sales | Social | Defense
- Difficulty filter: All | Beginner | Intermediate | Advanced
- Sort: Recommended (default) | Newest | Most Popular | Quickest
- Search bar (right side)

**Grid: 3 columns on desktop, 2 on tablet, 1 on mobile**

**Each Scenario Card (aspect ratio ~3:2):**
- Top section: category color band (thin, 4px) + category icon
- **Title:** Bold, 18px. e.g., "The Credit Thief"
- **Subtitle:** One line. e.g., "Your colleague takes credit for your work in a team meeting"
- **Metadata row:**
  - ⚡⚡ Medium
  - ⏱️ 8 min
  - 📊 3 techniques
- **Technique preview:** 2-3 small pills showing primary techniques (e.g., `Reframing` `Strategic Silence`)
- **Completion badge** (if done): ✅ with score (e.g., "87%")
- Hover state: slight lift + border glow in category color

**"Recommended For You" section** at top of grid — 3 cards based on user's theater + current skill gaps.

### 5b: Scenario Detail Page

**Layout: Hero section + two-column body**

**Hero (full-width, ~200px):**
- Dark gradient background with subtle document texture
- Title (large, 28px)
- Category badge + difficulty + estimated time
- [Start Scenario] primary CTA + [Practice Mode] secondary CTA

**Left Column (65%): Briefing**
- **SITUATION BRIEFING** header (stencil font)
- 2-3 paragraph description of the situation. Written in second person: "You've been at the company for two years. Your colleague, Mark, has been consistently..."
- **YOUR OBJECTIVE:** Bolded goal statement. "Reclaim credit without damaging the relationship or appearing petty."
- **KEY PRINCIPLES:** Numbered list of 3-4 relevant techniques with brief explanations
- **WHAT TO WATCH FOR:** 2-3 common mistakes people make in this situation

**Right Column (35%): Intelligence**
- **Difficulty Breakdown:** Mini radar chart showing which skills this tests (assertiveness, strategic thinking, emotional control, etc.)
- **Techniques You'll Practice:** List with mastery indicators
- **Related Scenarios:** 2-3 cards linking to similar scenarios
- **Community Stats:** "Average score: 72%" / "Completed by 1,243 operators"

### 5c: Guided Scenario Flow

After clicking "Start Scenario":

**Full-screen focused mode** (sidebar collapses, no other navigation visible — intentional focus):

**Phase 1: Extended Briefing (1 screen)**
- Detailed context setup. Introduces the "other party" — their personality, their likely motivations, their communication style.
- "Ready to begin" button.

**Phase 2: Decision Points (3-5 turns)**
- Each turn presents:
  - **What's happening:** Narrative text describing the situation moment
  - **What they said/did:** The other party's action (in a chat-bubble or quoted block)
  - **Your options:** 3-4 response choices, each labeled with the underlying technique:
    - Option A: "[Response text]" — *Uses: Direct Confrontation*
    - Option B: "[Response text]" — *Uses: Strategic Questioning*
    - Option C: "[Response text]" — *Uses: Tactical Withdrawal*
    - Option D: "Write your own response" → freeform text, AI evaluates
  - After selecting: AI narrates the result. What the other party does next. How the dynamic shifts.
  - **Coaching Note** appears below: "Good choice. Here's why this works: [explanation]. However, watch out for [risk]."

**Phase 3: Climax/Resolution (1-2 turns)**
- The pivotal moment. Options have higher stakes.
- Consequences of earlier choices affect available options here.

**Phase 4: Outcome**
- Narrative conclusion based on user's choices
- Outcome rating: ★★★★☆ with description ("You achieved your objective while maintaining the relationship, but left some leverage on the table.")

### 5d: Debrief Screen

**Full-width, scrollable report:**

- **MISSION DEBRIEF** header with completion stamp
- **Overall Score:** Large number (0-100) with letter grade
- **Breakdown:**
  - Objective achieved? ✅/❌ + explanation
  - Relationship preserved? ✅/❌ + explanation
  - Techniques used effectively: list with ✅/❌ per technique
  - Techniques missed: "You could have used [X] at turn 3 when they said [Y]"
- **Turn-by-Turn Review:** Expandable sections for each turn showing:
  - What you chose
  - What would have happened with other choices (briefly)
  - Optimal choice and why
- **Techniques Mastered/Practiced:** Updated mastery indicators
- **XP Earned:** Points + any badge unlocked
- **Actions:**
  - [Retry Scenario] — start over, try different approaches
  - [Practice Mode] — same scenario but as a free-form role-play
  - [Similar Scenarios] — recommendations
  - [Discuss with Coach] — opens AI Coach chat with scenario context

---

## 6. Role-Play Simulator

### 6a: Setup Screen

**Page: /role-play**

**Three-step setup, single page, side-by-side on desktop:**

**Column 1: Choose Your Scenario**
- Dropdown search + categories
- Or: "Describe a custom scenario" freeform text area
- Or: "Import from Coach Chat" — pulls context from a recent AI Coach conversation
- Or: "Import from Screenshot" — uses a past screenshot analysis as the basis

**Column 2: Configure Difficulty**
- **Difficulty slider:** Easy → Medium → Hard
  - Easy: other party is predictable, responds to techniques well, makes mistakes
  - Medium: other party is moderately skilled, pushes back, uses some counter-techniques
  - Hard: other party is highly skilled, manipulative, detects your techniques, adapts
- **Personality Type** of the other party (select one):
  - 🦊 The Manipulator — evasive, uses deflection, guilt-trips
  - 🦁 The Aggressor — confrontational, intimidating, uses pressure
  - 🐍 The Passive-Aggressive — indirect, backhanded compliments, plausible deniability
  - 🦉 The Rational — logical, unemotional, hard to influence through emotions
  - 🐺 The Charmer — disarming, likeable, makes you drop your guard
  - 🤖 Custom — describe the personality

**Column 3: Your Objectives**
- Auto-populated based on scenario, editable
- "Win condition" — what counts as success
- "Constraints" — optional: e.g., "Don't burn the bridge", "Stay professional", "No direct confrontation"

**[Begin Simulation]** button at bottom, full-width

### 6b: Simulation Interface

**Desktop: Three-panel layout**

**Left Panel (25%): Technique Suggestions (real-time)**
- As the conversation progresses, AI suggests techniques in real-time:
  - "They just used [Anchoring] — consider [Re-Anchoring] or [Deflection]"
  - Suggestions are context-aware, change with each message
  - Each suggestion is a clickable card: click to see a quick explanation + example phrase
  - Toggle: "Show suggestions" / "Hide suggestions" (for advanced users who want to fly blind)
- Below suggestions: **Live Technique Tracker**
  - List of techniques you've used so far in this session
  - List of techniques the other party has used

**Center Panel (50%): Chat Interface**
- Similar to AI Coach chat but with different visual treatment:
  - Other party's messages: left-aligned, styled with their personality color
  - Your messages: right-aligned
  - Other party has a persona name and icon (e.g., "Mark — 🦊 The Manipulator")
- Text input at bottom with:
  - Regular text input
  - "Technique hint" button (📌) — shows a quick-reference list of applicable techniques
  - "Pause & Think" button (⏸️) — pauses the simulation, lets user think without time pressure. In Hard mode, adds a time limit.

**Right Panel (25%): Session Stats (live-updating)**
- **Power Balance Meter:** Real-time visual showing who's currently "winning" the exchange
- **Technique Usage:** Bar chart of your techniques used vs. available
- **Turn Count:** N/20 (sessions have a natural end point)
- **Detected Patterns:** AI flags when you're falling into patterns ("You've used deflection 3 times — they'll catch on. Try something new.")

### 6c: Simulation End

**Triggers:** User clicks "End Simulation", natural conversation endpoint reached, or turn limit hit.

**Transition:** Chat fades slightly, "SIMULATION COMPLETE" overlay with score.

### 6d: Post-Session Analysis

**Full-page report (same layout philosophy as scenario debrief):**

- **Performance Score:** 0-100
- **Power Dynamics Timeline:** Line chart showing power balance over the conversation. X-axis = turns, Y-axis = who's in control. Annotated with key moments.
- **Technique Analysis:**
  - Techniques you used: list with effectiveness rating (1-5 stars per use)
  - Techniques the other party used: list with whether you successfully countered them
  - Missed opportunities: "At turn 7, when they said X, you could have used [Technique] for a stronger position"
- **Communication Style Analysis:**
  - Assertiveness score
  - Adaptability score (did you vary techniques or repeat the same ones?)
  - Emotional control score (did you respond reactively or strategically?)
- **Key Quotes:** 2-3 of your best and worst responses, with explanations
- **Improvement Plan:** Specific technique to practice next, with link to relevant scenario
- **Actions:**
  - [Replay — Same Settings] — try again with same scenario/difficulty
  - [Replay — Harder] — increase difficulty
  - [Replay — Different Personality] — same scenario, different counterpart
  - [Export Analysis] — PDF
  - [Discuss with Coach] — opens AI Coach with the full session as context

---

## 7. Knowledge Library

### 7a: Library Home

**Page: /library**

**Top: Search Bar (prominent, full-width, 56px tall)**
- Placeholder: "Search techniques, books, principles..."
- Instant search results as user types (debounced 200ms)
- Results grouped: Techniques | Books | Principles | Scenarios

**Below Search: Category Grid**
- Large category cards (2 rows, 3 columns on desktop):
  - **Cialdini's 6 Principles** — Reciprocity, Commitment, Social Proof, Authority, Liking, Scarcity
  - **Dark Triad** — Machiavellianism, Narcissism, Psychopathy (recognition & defense)
  - **NLP Techniques** — Anchoring, Reframing, Mirroring, Pacing & Leading
  - **Negotiation Tactics** — BATNA, Anchoring, Logrolling, Nibbling, Flinch
  - **Emotional Manipulation** — Gaslighting, Love Bombing, DARVO (defense-focused)
  - **Body Language & Non-Verbal** — Power poses, micro-expressions, proxemics
- Each card: category name, icon, technique count, color-coded

### 7b: Category Page

**Page: /library/[category]**

- **Header:** Category name, description (2 sentences), number of techniques
- **Technique Grid:** Cards sorted by relevance (default) or alphabetical
- Each technique card:
  - Name (bold)
  - One-line definition
  - Difficulty to master: ⚡/⚡⚡/⚡⚡⚡
  - User's mastery level: progress bar (0-100%)
  - Category color accent

### 7c: Technique Detail Page

**Page: /library/[category]/[technique]**

**Layout: Single column, max-width 720px, centered (like a well-formatted article)**

- **Header:** Technique name (large), category badge, difficulty, user mastery level
- **Quick Definition:** 1 sentence, bolded. The "Wikipedia first line."
- **How It Works:** 2-3 paragraphs explaining the psychology. Written clearly, not academically.
- **Real-World Examples:**
  - 3 examples across different contexts (career, relationship, sales)
  - Each example: "Situation → Technique Applied → Result"
  - Presented as concise case studies in collapsible sections
- **When to Use:** Bullet list of ideal situations
- **When NOT to Use:** Bullet list of situations where this backfires. This is crucial for ethical framing.
- **Common Mistakes:** What people get wrong when first using this technique
- **Counter-Techniques:** How to defend against someone using this on you. Links to those techniques.
- **Related Techniques:** 3-4 pills linking to complementary techniques
- **Source Material:** Book references with chapter/page numbers. Click to see book summary.
- **[See In Action]** button — links to 2-3 scenarios that heavily feature this technique
- **[Practice This]** button — opens a micro-scenario focused on this technique
- **[Discuss with Coach]** — opens AI Coach with "Help me understand and apply [technique name]" pre-loaded

### 7d: Book Summaries

**Page: /library/books**

- Grid of book covers (real covers if licensing allows, otherwise stylized cards)
- Each book:
  - Title, Author
  - Shadow Persuasion rating: ★★★★★
  - "Key takeaways: 12" | "Techniques covered: 8"
  - Click → Book summary page

**Book Summary Page:**
- Book info (title, author, publication year)
- **Executive Summary:** 3-4 paragraph overview
- **Key Takeaways:** Numbered list, 8-15 items, each 2-3 sentences
- **Techniques from This Book:** Grid of technique cards
- **Best Quotes:** 5-10 highlighted quotes
- **Who Should Read This:** Recommendations based on user level/theater

---

## 8. Progress & Tracking

### 8a: Progress Dashboard

**Page: /progress**

**Top Section: Overview Stats**
- 4 stat cards in a row:
  - 🏆 **Total XP:** 12,450
  - 📊 **Techniques Mastered:** 14/87
  - 🔥 **Current Streak:** 12 days
  - 🎯 **Scenarios Completed:** 23

**Section 2: Proficiency Radar Chart (prominent, centered, ~400px)**
- 6-axis radar: Persuasion | Negotiation | Emotional Intelligence | Defense | Social Dynamics | Strategic Thinking
- Filled area shows current level
- Ghost overlay shows level from 30 days ago (progress visualization)
- Clickable axes: clicking an axis shows detailed breakdown for that category

**Section 3: Technique Mastery Table**
- Sortable, filterable table:
  - Technique name | Category | Mastery Level (progress bar) | Times Practiced | Last Practiced
- Mastery levels: Novice (0-25%) → Apprentice (25-50%) → Practitioner (50-75%) → Expert (75-100%)
- Click any row to go to that technique's library page

**Section 4: Activity Timeline**
- Vertical timeline, most recent first
- Each entry: icon + "Completed scenario: The Credit Thief — Score: 87%" + timestamp
- Filter by type: Scenarios | Role-Plays | Coach Chats | Screenshots | Field Reports

### 8b: Field Reports

**Page: /progress/field-reports**

This is the user's private journal for real-world application.

**New Field Report Form:**
- **Date:** Auto-filled, editable
- **Situation:** Text area (what happened)
- **Techniques Used:** Multi-select from technique library (autocomplete)
- **Outcome:** Rating (1-5 stars) + text area
- **Lessons Learned:** Text area
- **Attach Screenshot:** Optional
- **Visibility:** Private only (emphasized — this is never shared)

**Field Report List:**
- Cards sorted by date
- Each card: date, situation preview, techniques used (pills), outcome stars
- Filter by technique, outcome rating, date range

### 8c: Weekly/Monthly Reports

Auto-generated, delivered as in-app notification + optional email.

**Weekly Report Content:**
- Sessions completed this week
- New techniques practiced
- Mastery level changes (what improved, what needs work)
- Comparison to previous week
- Recommended focus for next week
- "Your best move this week" — highlights the most effective technique usage from their sessions

### 8d: Gamification

**XP System:**
- Complete a scenario: 50-150 XP based on difficulty
- Complete a role-play: 100-300 XP based on difficulty and score
- Use AI Coach: 10 XP per session
- Analyze a screenshot: 25 XP
- Submit a field report: 50 XP
- Daily mission: 100 XP bonus
- Streak bonuses: 7-day = 200 XP, 30-day = 1000 XP

**Badges/Achievements:**
- Styled as "classified clearance badges" — circular emblems with monochrome designs
- Examples:
  - "First Blood" — Complete your first scenario
  - "Countermeasures Expert" — Successfully counter 50 techniques
  - "The Operator" — Reach Expert level in any technique
  - "Polyglot" — Practice techniques from 5+ categories
  - "Field Tested" — Submit 10 field reports
  - "Shadow Master" — Reach Expert level in 25 techniques

---

## 9. Mobile UX

### Core Principle: Mobile is for CAPTURE and QUICK ACCESS, not deep study.

**Mobile Nav: Bottom tab bar (5 tabs)**
1. 🏠 Home (dashboard)
2. 📸 Analyze (screenshot upload — camera-first on mobile)
3. 💬 Chat (AI Coach)
4. ⚔️ Train (scenarios + role-play)
5. 👤 Profile (progress + settings)

### Mobile-Specific Patterns:

**Screenshot Analyzer:**
- Tab opens directly to camera (not a menu). One tap to capture.
- Paste from clipboard also works (detects image in clipboard on app open)
- Results screen: single-column, screenshot at top, analysis below, actions as sticky bottom bar

**AI Coach Chat:**
- Full-screen chat, no sidebar
- Technique tags are tappable (bottom sheet with details, not hover)
- Quick action buttons appear above keyboard as horizontal pill strip
- Voice input button prominent (40px, right of text input)

**Scenarios:**
- Swipeable cards (like Tinder) for browsing scenarios — swipe right to save, tap to open
- During scenario: full-screen, one decision at a time, large tap targets
- Debrief: scrollable single column

**Push Notifications:**
- Daily mission reminder (customizable time, default 9am user's local time)
- "Your streak is about to expire" (8pm if no activity that day)
- Weekly report ready
- New scenario available in your theater
- Do NOT notification-spam. Max 2/day. User controls everything.

**Quick-Access Widget (iOS/Android):**
- "Analyze Screenshot" — opens camera directly
- "Quick Chat" — opens AI Coach instantly
- "Today's Mission" — shows current mission with tap-to-start

---

## 10. Information Architecture

### Full Sitemap

```
/
├── /onboarding
│   ├── /signup
│   ├── /profile (intake quiz)
│   └── /first-mission
├── /dashboard (Command Center)
├── /analyze
│   ├── [upload/capture]
│   ├── /analyze/[id] (results)
│   └── /analyze/history
├── /coach
│   ├── /coach/new (context setup)
│   ├── /coach/[session-id] (active chat)
│   └── /coach/history
├── /scenarios
│   ├── /scenarios?category=[X]&difficulty=[Y]
│   ├── /scenarios/[id] (detail)
│   ├── /scenarios/[id]/play (guided flow)
│   └── /scenarios/[id]/debrief
├── /role-play
│   ├── /role-play/setup
│   ├── /role-play/[session-id] (active simulation)
│   └── /role-play/[session-id]/analysis
├── /library
│   ├── /library/[category]
│   ├── /library/[category]/[technique]
│   ├── /library/books
│   └── /library/books/[id]
├── /progress
│   ├── /progress/techniques
│   ├── /progress/field-reports
│   ├── /progress/field-reports/new
│   ├── /progress/achievements
│   └── /progress/reports
├── /settings
│   ├── /settings/profile
│   ├── /settings/notifications
│   ├── /settings/billing
│   └── /settings/data
└── /search?q=[query]
```

### Navigation Structure

**Desktop: Persistent left sidebar + top command bar**
- Sidebar: Always visible (collapsible to icon-only). Contains all primary nav.
- Command Bar: `Cmd+K` / `Ctrl+K` opens a command palette (Spotlight-style). Search anything: techniques, scenarios, past chats, settings. Power users live here.
- Breadcrumbs: Only on deep pages (e.g., Library → Cialdini → Reciprocity). Not on primary pages.

**Mobile: Bottom tab bar + hamburger for secondary nav**
- 5 primary tabs as described in Section 9
- Hamburger (top-left): Settings, Field Reports, Achievements, Help

**Hierarchy Depth: Maximum 3 levels.** No page is more than 3 taps from the dashboard.
- Level 1: Dashboard, Analyze, Coach, Scenarios, Role-Play, Library, Progress
- Level 2: Category pages, individual items, history views
- Level 3: Detail views (technique page, session analysis, book summary)

### Search & Filtering

**Global Search (Cmd+K):**
- Searches across: techniques, scenarios, books, past chats (by content), field reports
- Results grouped by type with section headers
- Recent searches shown on empty state
- Keyboard navigable (arrow keys + enter)

**Contextual Filters:**
- Each section has its own filter bar (scenarios, library, history)
- Filters use horizontal pill/chip pattern — visible, not hidden in a dropdown
- Active filters shown with count badge
- "Clear all" always visible when filters are active

---

## 11. Design System

### From Marketing Site to Product

The marketing/landing page can go heavy on the classified-document aesthetic — redacted text, stamp effects, dossier folders, dramatic typography. The **product UI** dials this back to ~20% thematic, 80% functional:

- **Marketing site:** "You just found a classified document."
- **Product UI:** "You're the person who writes classified documents."

The product should feel like the *user's* workspace, not a themed experience. The classified aesthetic manifests as:
- Typography choices (monospace metadata, stencil headers)
- Color temperature (warm darks, amber accents)
- Micro-details (dashed borders, stamp animations on achievements)
- Empty states (redacted-text jokes, "NO DATA — BEGIN OPERATIONS")
- Loading states (scanning animations, terminal-style text)

### Color System

**Primary palette (dark mode only — no light mode option):**

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-base` | `#0B0D10` | Page background |
| `--bg-surface` | `#13161C` | Cards, panels, modals |
| `--bg-elevated` | `#1A1E26` | Hover states, active panels |
| `--bg-input` | `#0F1115` | Input fields, text areas |
| `--border-subtle` | `#1E2330` | Dividers, card borders |
| `--border-active` | `#2E3545` | Focused inputs, active states |
| `--text-primary` | `#E8E6E3` | Main content text (warm white, not blue-white) |
| `--text-secondary` | `#8B8D93` | Metadata, labels, placeholders |
| `--text-muted` | `#4A4D55` | Disabled text, watermarks |
| `--accent-primary` | `#C4A44E` | Primary CTAs, key interactive elements (muted gold/amber) |
| `--accent-primary-hover` | `#D4B85E` | Hover state for primary accent |
| `--accent-success` | `#3D8B5E` | Positive indicators, "in control" states |
| `--accent-danger` | `#8B3D3D` | Warnings, "losing control" states |
| `--accent-info` | `#3D6B8B` | Informational, neutral highlights |

**Technique Category Colors:**
| Category | Color | Hex |
|----------|-------|-----|
| Persuasion | Amber | `#C4A44E` |
| Manipulation (detect) | Red-muted | `#8B4545` |
| Negotiation | Blue-steel | `#4A6B8B` |
| Social Dynamics | Purple-muted | `#6B4A8B` |
| Defense | Green-muted | `#3D8B5E` |
| Emotional Intel | Teal | `#3D8B8B` |

**Why no light mode:** This product's core identity is dark, covert, exclusive. Light mode would dilute the brand and the emotional experience. The dark palette is carefully designed for readability with warm-tinted neutrals (no eye strain).

### Typography

| Role | Font | Weight | Size | Line Height |
|------|------|--------|------|-------------|
| Display / Page Titles | `Space Grotesk` | 700 | 28-32px | 1.2 |
| Section Headers | `Space Grotesk` | 600 | 20-24px | 1.3 |
| Thematic Headers | `Special Elite` or `Courier Prime` | 400 | 14-16px, ALL CAPS, tracking 0.15em | 1.4 |
| Body Text | `Inter` | 400 | 15-16px | 1.65 |
| Chat Messages | `Inter` | 400 | 15px | 1.6 |
| Metadata / Labels | `IBM Plex Mono` | 400 | 12-13px | 1.5 |
| Code / Technique Tags | `IBM Plex Mono` | 500 | 13px | 1.4 |
| Buttons | `Inter` | 600 | 14-15px | 1.0 |

**Why these choices:**
- `Space Grotesk`: Modern geometric sans with enough personality to feel distinctive, not generic
- `Inter`: Optimized for screens, excellent for long reading sessions (chat, library articles)
- `IBM Plex Mono`: Clean monospace that reads as "technical/classified" without being gimmicky
- `Special Elite` / `Courier Prime`: Used ONLY for thematic section headers ("MISSION BRIEFING", "ANALYSIS REPORT"). Never for body text.
- 15-16px body with 1.65 line height: critical for the long chat sessions users will have. No eye strain.

### Component Library

Build on **Radix UI primitives** (for accessibility) + **Tailwind CSS** (for styling) + custom theme layer.

**Key Components:**
- `Card` — with paper-texture variant for themed content
- `Button` — Primary (gold fill), Secondary (border-only), Ghost (text-only), Danger
- `Input` / `TextArea` — dark bg, subtle border, amber focus ring
- `Badge/Pill` — technique tags, category markers, difficulty indicators
- `Tooltip` — dark with warm bg, used heavily for technique explanations
- `Modal/Dialog` — screenshot analyzer upload, confirmations
- `SlideOver` — technique detail panel that slides from right (in-context, doesn't leave page)
- `Tabs` — conversation branches, category filters
- `Progress Bar` — mastery levels, loading states
- `Radar Chart` — proficiency visualization (build with D3 or Recharts)
- `Timeline` — activity feed, power dynamics chart
- `Chat Bubble` — distinct styling for user vs. AI vs. simulated counterpart

### Animation / Micro-Interaction Principles

1. **Fast & functional over flashy.** Transitions: 150-200ms max for UI state changes. No 500ms fades.
2. **Themed animations ONLY in non-blocking moments:**
   - Loading states: scanning line effect, terminal-text appearance
   - Achievement unlocks: stamp/seal animation (300ms)
   - Completion screens: "MISSION COMPLETE" text fade-in with slight shake
3. **Interaction feedback:**
   - Buttons: slight scale on press (0.98), not color change alone
   - Cards: subtle lift on hover (2px translateY + shadow)
   - Copy-to-clipboard: checkmark morph animation (200ms)
   - Technique tags: expand on hover to show definition (200ms, slide-down)
4. **Chat-specific:**
   - AI typing indicator: three dots BUT styled as a "DECRYPTING..." pulse (on brand without being slow)
   - New message: slide up from bottom (100ms)
   - Branch switch: crossfade (200ms)
5. **NO:** Parallax scrolling, page transition animations, bouncy/springy physics, confetti, or any animation that delays the user from doing their task.

---

## 12. Wireframe Descriptions

### 12a: Dashboard — Desktop (1440px viewport)

```
┌──────────────────────────────────────────────────────────────────────┐
│ SIDEBAR (240px)          │  MAIN CONTENT (1200px)                    │
│                          │                                           │
│ [Logo: SP monogram]      │  ┌─────────────────────────────────────┐  │
│                          │  │ MISSION BRIEFING BANNER              │  │
│ [Avatar]                 │  │ Left: "27 MAR 2026 — Good evening,  │  │
│ OPERATOR-7741            │  │        Operator."                    │  │
│                          │  │ Right: Daily Mission card            │  │
│ ─ ─ ─ ─ ─ ─ ─ ─         │  │        🔥 12-day streak             │  │
│                          │  └─────────────────────────────────────┘  │
│ 📊 Command Center  ←    │                                           │
│ 📸 Analyze               │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│ 💬 Coach                 │  │Analyze│ │New   │ │Quick │ │Field │   │
│ 🎯 Scenarios             │  │Screen │ │Chat  │ │RP    │ │Report│   │
│ ⚔️ Role-Play             │  │shot   │ │      │ │      │ │      │   │
│ 📚 Library               │  └──────┘ └──────┘ └──────┘ └──────┘   │
│ 📈 Progress              │  QUICK ACTIONS BAR                       │
│ ⚙️ Settings              │                                           │
│                          │  ┌─ ACTIVE OPERATIONS ────────────────┐  │
│                          │  │ [Chat card] [Scenario card] → scroll│  │
│                          │  └────────────────────────────────────┘  │
│                          │                                           │
│                          │  ┌─ THREAT RADAR ─────┐ ┌─ STATS ────┐  │
│                          │  │ Trending Techniques │ │ Radar chart │  │
│                          │  │ - Technique 1       │ │             │  │
│                          │  │ - Technique 2       │ │ 14/87 mstr  │  │
│                          │  │ - Technique 3       │ │ 8 sessions  │  │
│                          │  └────────────────────┘ │ 12d streak  │  │
│ ─ ─ ─ ─ ─ ─ ─ ─         │                          └─────────────┘  │
│ [+ Field Report]         │  ┌─ RECENT ACTIVITY ─────────────────┐  │
│                          │  │ • Analyzed screenshot — 3 tech [2h]│  │
│                          │  │ • Completed: Salary Neg. [yest]    │  │
│                          │  │ • Coach session — 12 msgs [yest]   │  │
│                          │  └────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

### 12b: Dashboard — Mobile (390px viewport)

```
┌─────────────────────────┐
│ SP    OPERATOR-7741  ⚙️  │ ← Top bar (56px)
├─────────────────────────┤
│                          │
│ 27 MAR 2026             │
│ Good evening, Operator.  │
│                          │
│ ┌──────────────────────┐ │
│ │ 🎯 DAILY MISSION     │ │
│ │ Door-in-the-Face     │ │
│ │ ⚡⚡ Medium  🔥 12    │ │
│ │ [Accept Mission]     │ │
│ └──────────────────────┘ │
│                          │
│ ┌─────┐┌─────┐          │
│ │ 📸  ││ 💬  │          │ ← Quick actions (2x2 grid)
│ │Scan ││Chat │          │
│ └─────┘└─────┘          │
│ ┌─────┐┌─────┐          │
│ │ ⚔️  ││ 📝  │          │
│ │Train││Report│         │
│ └─────┘└─────┘          │
│                          │
│ ACTIVE OPERATIONS        │
│ ┌──────────────────────┐ │
│ │ Coach: Salary talk   │ │ ← Horizontal scroll
│ └──────────────────────┘ │
│                          │
│ INTELLIGENCE BRIEFING    │
│ ┌──────────────────────┐ │
│ │ Reciprocity...       │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ Strategic Silence...  │ │
│ └──────────────────────┘ │
│                          │
├─────────────────────────┤
│ 🏠  📸  💬  ⚔️  👤      │ ← Bottom tabs (56px)
└─────────────────────────┘
```

### 12c: Screenshot Analyzer Results — Desktop

```
┌──────────────────────────────────────────────────────────────────────┐
│ SIDEBAR │  ANNOTATED IMAGE (45%)  │ ANALYSIS (35%)   │ ACTIONS (20%)│
│         │                          │                   │              │
│         │  ┌────────────────────┐  │ ANALYSIS REPORT   │ ┌──────────┐│
│         │  │                    │  │ 27 MAR 2026 1423  │ │ Generate ││
│         │  │   [Screenshot      │  │                   │ │ Counter- ││
│         │  │    with colored    │  │ POWER DYNAMICS    │ │ Response ││
│         │  │    overlay boxes   │  │ ├────●────────┤   │ └──────────┘│
│         │  │    numbered ①②③④  │  │ You ←──→ Them    │              │
│         │  │    around          │  │ Score: 3/10       │ Practice    │
│         │  │    identified      │  │ "They hold most   │ This        │
│         │  │    techniques]     │  │  leverage here"   │ Scenario    │
│         │  │                    │  │                   │              │
│         │  │                    │  │ TECHNIQUES:       │ Save to     │
│         │  └────────────────────┘  │                   │ Dossier     │
│         │                          │ ① Guilt Trip      │              │
│         │                          │   Category: Manip │ Share       │
│         │                          │   Severity: ●● Hi │ Analysis    │
│         │                          │   "They used..."  │              │
│         │                          │                   │ Start Coach │
│         │                          │ ② Anchoring       │ Chat        │
│         │                          │   Category: Nego  │              │
│         │                          │   Severity: ● Med │              │
│         │                          │   "By starting..."│              │
│         │                          │                   │              │
│         │                          │ ③ False Dilemma   │              │
│         │                          │   ...             │              │
│         │                          │                   │              │
│         │                          │ OVERALL:          │              │
│         │                          │ "The sender is    │              │
│         │                          │  using a combina- │              │
│         │                          │  tion of..."      │              │
└──────────────────────────────────────────────────────────────────────┘
```

### 12d: AI Coach Chat — Desktop

```
┌──────────────────────────────────────────────────────────────────────┐
│ SIDEBAR │  CHAT AREA (65%)                    │ TECHNIQUE PANEL (35%)│
│         │                                      │                     │
│         │  ┌─ CONTEXT CARD (pinned) ────────┐  │ ACTIVE TECHNIQUES   │
│         │  │ Career: Manager taking credit   │  │                     │
│         │  │ Goal: Reclaim without conflict  │  │ ├ Reframing (×3)   │
│         │  │ [Edit]                          │  │ │  ████░ Advanced   │
│         │  └────────────────────────────────┘  │ │  [Practice]       │
│         │                                      │ ├ Anchoring (×1)    │
│         │  ┌─ HANDLER ─────────────────────┐  │ │  ██░░░ Novice     │
│         │  │ Based on your situation, I'd   │  │ │  [Practice]       │
│         │  │ recommend starting with        │  │ ├ Mirroring (×2)   │
│         │  │ [Reframing] the narrative.     │  │    █████ Expert     │
│         │  │ Here's why: ...                │  │                     │
│         │  │                                │  │ ─ ─ ─ ─ ─ ─ ─ ─   │
│         │  │ Source: Cialdini, Ch. 4¹       │  │                     │
│         │  │                                │  │ SUGGESTED           │
│         │  │ ┌─────────┐ ┌──────────┐      │  │ TECHNIQUES          │
│         │  │ │Simulate │ │More      │      │  │                     │
│         │  │ │Response │ │Assertive │      │  │ • Strategic Silence │
│         │  │ └─────────┘ └──────────┘      │  │   "Could help at   │
│         │  │ ┌──────────┐ ┌──────────┐     │  │    the meeting"    │
│         │  │ │Softer    │ │Role-play │     │  │   [Learn] [Try]    │
│         │  │ │Approach  │ │This      │     │  │                     │
│         │  │ └──────────┘ └──────────┘     │  │ • Door-in-the-Face │
│         │  └───────────────────────────────┘  │   "For your next   │
│         │                                      │    request"         │
│         │             ┌────────────────────┐  │   [Learn] [Try]    │
│         │  [You]      │ I think that could │  │                     │
│         │             │ work. But what if  │  │ ─ ─ ─ ─ ─ ─ ─ ─   │
│         │             │ he gets defensive? │  │                     │
│         │             └────────────────────┘  │ SITUATION SUMMARY   │
│         │                                      │ • Manager: Mark    │
│         │  ┌──────────────────────────────┐   │ • Dynamic: He has  │
│         │  │ [🎤] Type your message...     │   │   positional power │
│         │  │                        [Send]│   │ • You want: credit │
│         │  └──────────────────────────────┘   │   without conflict │
└──────────────────────────────────────────────────────────────────────┘
```

### 12e: Role-Play Simulator — Desktop

```
┌──────────────────────────────────────────────────────────────────────┐
│ SIDEBAR │ SUGGESTIONS (25%)│ SIMULATION (50%)      │ STATS (25%)    │
│         │                   │                        │                │
│         │ TECHNIQUE HINTS   │ ┌ Mark (🦊 Manipulator)│ POWER BALANCE  │
│         │                   │ │ "I don't see what    │ ├──●──────────┤│
│         │ ┌───────────────┐ │ │  the big deal is.    │ You ←──→ Them │
│         │ │ They just used │ │ │  We're a team,       │                │
│         │ │ [Minimizing]. │ │ │  right?"             │ TECHNIQUE USE  │
│         │ │ Consider:      │ │ └────────────────────┘│ ██░░ Reframe  │
│         │ │ • Re-Anchoring │ │                        │ ███░ Mirror   │
│         │ │ • Broken Record│ │         ┌────────────┐│ █░░░ Silence  │
│         │ │ [Details ↓]   │ │  [You]  │ I          ││                │
│         │ └───────────────┘ │         │ appreciate  ││ TURN 4/20     │
│         │                   │         │ the team    ││                │
│         │ ┌───────────────┐ │         │ angle, and  ││ PATTERNS      │
│         │ │ Also consider │ │         │ I want to...││ ⚠️ You've used │
│         │ │ [Strategic    │ │         └────────────┘│ deflection 3x. │
│         │ │  Questioning] │ │                        │ Mix it up.     │
│         │ │ to shift the  │ │  ┌──────────────────┐ │                │
│         │ │ burden.       │ │  │[📌][⏸️] Type... [→]│ │                │
│         │ └───────────────┘ │  └──────────────────┘ │                │
│         │                   │                        │                │
│         │ YOUR TECHNIQUES   │                        │                │
│         │ • Reframing ×2   │                        │                │
│         │ • Mirroring ×1   │                        │                │
│         │                   │                        │                │
│         │ THEIR TECHNIQUES  │                        │                │
│         │ • Minimizing ×2  │                        │                │
│         │ • Guilt Trip ×1  │                        │                │
└──────────────────────────────────────────────────────────────────────┘
```

### 12f: Knowledge Library — Technique Detail — Desktop

```
┌──────────────────────────────────────────────────────────────────────┐
│ SIDEBAR │  CONTENT (max-width: 720px, centered)                      │
│         │                                                             │
│         │  ← Back to Cialdini's Principles                           │
│         │                                                             │
│         │  RECIPROCITY                                                │
│         │  Category: [Persuasion]  Difficulty: ⚡⚡  Mastery: ███░ 67%│
│         │                                                             │
│         │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─               │
│         │                                                             │
│         │  **People feel obligated to return favors, even             │
│         │  unsolicited ones.**                                        │
│         │                                                             │
│         │  HOW IT WORKS                                               │
│         │  When someone does something for us — even something        │
│         │  small or unwanted — we feel a powerful psychological       │
│         │  pressure to reciprocate. This operates below conscious     │
│         │  awareness and...                                           │
│         │  [3 paragraphs of clear explanation]                        │
│         │                                                             │
│         │  REAL-WORLD EXAMPLES                                        │
│         │  ▸ Career: Your colleague covers your shift...  [expand]   │
│         │  ▸ Sales: Free samples at Costco aren't...     [expand]   │
│         │  ▸ Relationship: They buy an expensive...      [expand]   │
│         │                                                             │
│         │  WHEN TO USE                                                │
│         │  • Before making a request, provide value first             │
│         │  • When building long-term alliances                        │
│         │  • To create a sense of obligation before negotiation       │
│         │                                                             │
│         │  WHEN NOT TO USE                                            │
│         │  • When the other party is aware of the technique           │
│         │  • In relationships where trust is already fragile          │
│         │  • When the "gift" could be seen as a bribe                │
│         │                                                             │
│         │  COUNTER-TECHNIQUES                                         │
│         │  [Declining Gifts] [Reframing the Exchange]                │
│         │                                                             │
│         │  RELATED TECHNIQUES                                         │
│         │  [Door-in-the-Face] [Foot-in-the-Door] [Concession]       │
│         │                                                             │
│         │  SOURCE: Cialdini, "Influence", Ch. 2                      │
│         │                                                             │
│         │  ┌────────────┐  ┌───────────┐  ┌───────────────┐         │
│         │  │See in Action│  │Practice   │  │Discuss w/Coach│         │
│         │  └────────────┘  └───────────┘  └───────────────┘         │
└──────────────────────────────────────────────────────────────────────┘
```

### 12g: Progress Dashboard — Desktop

```
┌──────────────────────────────────────────────────────────────────────┐
│ SIDEBAR │  PROGRESS DASHBOARD                                        │
│         │                                                             │
│         │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                  │
│         │  │12,450│  │14/87 │  │ 🔥 12│  │  23  │                  │
│         │  │ XP   │  │Master│  │Streak│  │Scenes│                  │
│         │  └──────┘  └──────┘  └──────┘  └──────┘                  │
│         │                                                             │
│         │  ┌────────── PROFICIENCY RADAR ──────────┐                │
│         │  │                                        │                │
│         │  │           Persuasion                   │                │
│         │  │              /\                         │                │
│         │  │    Strategy /  \ Negotiation            │                │
│         │  │            / ●  \                       │                │
│         │  │    Social /  ██  \ Defense              │                │
│         │  │          \  ██  /                       │                │
│         │  │           \/──\/                        │                │
│         │  │         Emot. Intel                     │                │
│         │  │                                        │                │
│         │  │ ██ Current  ░░ 30 days ago             │                │
│         │  └────────────────────────────────────────┘                │
│         │                                                             │
│         │  TECHNIQUE MASTERY                                         │
│         │  ┌─────────────┬────────┬───────┬─────┬──────┐            │
│         │  │ Technique    │Category│Mastery│ ×   │ Last │            │
│         │  ├─────────────┼────────┼───────┼─────┼──────┤            │
│         │  │ Reciprocity  │Persuas │██░ 67%│ 12  │ 2d   │            │
│         │  │ Anchoring    │Negot.  │███ 82%│ 8   │ 1d   │            │
│         │  │ Mirroring    │Social  │████100│ 23  │ 4h   │            │
│         │  │ Gaslighting  │Defense │█░░ 34%│ 5   │ 1w   │            │
│         │  └─────────────┴────────┴───────┴─────┴──────┘            │
│         │  [Show All →]                                              │
│         │                                                             │
│         │  RECENT ACTIVITY                                           │
│         │  ● Completed scenario: Credit Thief — 87%        [2h ago] │
│         │  ● Coach session: Salary negotiation — 12 msgs   [yest]   │
│         │  ● Screenshot analyzed: 3 techniques detected    [yest]   │
│         │  ● Field report submitted: Client meeting         [3d ago] │
│         │  [View All →]                                              │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Notes

### Tech Stack Recommendation
- **Frontend:** Next.js 14+ (App Router) + Tailwind CSS + Radix UI
- **State:** Zustand (simple, lightweight, good for chat state)
- **Charts:** Recharts (radar, line) or D3 for the custom power dynamics visualizations
- **AI Integration:** Streaming responses via Server-Sent Events for chat and analysis
- **Image Processing:** Client-side resize/compress before upload (max 2MB to API)
- **Real-time:** WebSocket for role-play simulator (low-latency back-and-forth)
- **Search:** Typesense or Meilisearch for instant knowledge library search

### Performance Targets
- Dashboard load: <1.5s (SSR critical content, lazy-load below fold)
- Screenshot analysis: <5s from upload to results
- Chat response: first token <500ms (streaming)
- Role-play response: first token <300ms (pre-loaded context)
- Library search: <100ms

### Accessibility
- All interactive elements keyboard-navigable
- ARIA labels on all icons and non-text elements
- Color is never the ONLY indicator (always paired with icon or text)
- Minimum contrast ratio: 4.5:1 for body text against dark backgrounds (the warm whites ensure this)
- Screen reader announcements for chat messages, analysis results, score changes
- Reduced motion preference respected: disable scanning animations, use instant transitions

---

*End of specification.*
