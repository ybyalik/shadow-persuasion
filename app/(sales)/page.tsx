/* eslint-disable @next/next/no-img-element */
/**
 * The homepage: the main sales page. Rebuilt on 26 Oct after a joint Claude + ChatGPT review
 * (research/homepage-review): it sells what the book does (the hidden rules of power, the moves people use,
 * the calm words that answer them, how to ask in the open) for the broad buyer, in the direct style of the
 * problem pages. Order: hero, the moves, one message taken apart, before and after, a compact offer, what it's
 * for, real book pages, page-numbered list, how it works, contents, fit and limits, the app and the full offer,
 * FAQ, close, free chapter last. Every reply and quote comes from the book (book-v3/drafts).
 */
import type { Metadata } from 'next';
import { SubscribeForm } from '../_sales/SubscribeForm';
import { BuyButton, BuyNote } from '../_sales/ui';
import { Hero, MarginNote } from '../_sales/editorial';
import { AboutBook, Divider, FAQ_ITEMS, Footer, GuaranteeNight, Heading, Night, OfferBox, OrderCards, Sheet, StackList } from '../_sales/blocks';
import { CONTENTS } from '../_sales/contents';
import { HAS_PAGE_NUMBERS, pageRefShort } from '../_sales/pageRef';
import { Faq, ScenarioTabs, StickyBuyBar, TacticRolodex } from '../_sales/interactive';
import { SamplePage } from '../b/SamplePage';
import ideaCredit from '../p/data/idea-credit';
import manipulation from '../p/data/manipulation-tactics';

// The homepage is the one sales page search engines may index. Every other page in this group
// (checkout, upsell, thank-you, the free chapter) keeps the layout's noindex.
// FAQ: the six buying questions first, the rest folded under "More questions".
const FAQ_ORDER = ['What exactly do I get?', 'Is this a book about manipulating people?', 'How much is shipping, and how long does it take?', 'What is the difference between the paperback and the hardcover?', 'Is the app extra?', 'What if it is not for me?'];
const FAQ_FIRST = FAQ_ORDER.map((q) => FAQ_ITEMS.find((f) => f.q === q)!).filter(Boolean);
const FAQ_MORE = FAQ_ITEMS.filter((f) => !FAQ_ORDER.includes(f.q));

export const metadata: Metadata = { robots: { index: true, follow: true } };

// The pressure moves from Part II of the book: seven cards (the danger card is left out and gets its own visible line).
const MOVE_COUNT = 7;

// Two real pages: the ways a story changes (Chapter 8), and a worked exchange where the other person pushes back (Chapter 23).
const PAGES = [manipulation.excerpts.find((e) => e.ch === 8), ideaCredit.excerpts.find((e) => e.ch === 23)].filter((e) => e !== undefined);

// What the book teaches, part by part (app/_sales/contents.ts).
const LEARN = [
  { icon: 'eye', title: 'How power really works', body: 'Who actually decides at work, in families and in relationships, and the unwritten rules that shape those decisions.', where: 'Part I, chapters 1 to 5' },
  { icon: 'shield', title: 'How to spot manipulation and pressure', body: 'Guilt, favors called in, the silent treatment, charm, fake urgency, a story that keeps changing, and how to tell a bad moment from a pattern.', where: 'Part II, chapters 6 to 11' },
  { icon: 'hand', title: 'How to say no and hold it', body: 'Pause before agreeing, say no without a long excuse, and repeat your answer when someone pushes.', where: 'Chapters 3, 5 and 7' },
  { icon: 'speech', title: 'How to persuade people', body: 'Understand what the other person wants, ask questions about what they want, explain your case clearly, and handle pushback.', where: 'Part III, chapters 12 to 16' },
  { icon: 'key', title: 'How to negotiate and ask for more', body: 'Ask for more money, better terms and credit for your work, and build alternatives so you are not stuck with one answer.', where: 'Chapters 17 to 19 and 23' },
  { icon: 'briefcase', title: 'How to use it with real people', body: 'Bosses, coworkers, clients, partners, exes, parents and friends, plus pressure from groups and online.', where: 'Part V, chapters 23 to 27' },
  { icon: 'sprout', title: 'How to make it a habit', body: 'The 21-Day Power Reset: a few minutes a day of small practices, with a journal page for each day.', where: 'Part VII, chapters 31 to 34' },
];

// What it's for: the situations the book covers, each with its chapter. Includes asking, not only answering.
const USES = [
  { icon: 'briefcase', title: 'At work', ch: 'Chapter 23', body: 'A coworker repeats your idea in the meeting, the extra work never ends, or the raise is always "next time." What to send, what to say, and how to prepare your request.' },
  { icon: 'house', title: 'With a parent or family', ch: 'Chapter 26', body: 'Criticism on every call, comparisons, "after everything I’ve done for you," and one person doing all the care for an aging parent.' },
  { icon: 'rings', title: 'With a partner or an ex', ch: 'Chapters 9 and 25', body: 'The silent treatment, "that never happened," and an ex who turns every pickup text into a fight.' },
  { icon: 'receipt', title: 'Money and clients', ch: 'Chapter 24', body: 'A client who wants more for the same price, a relative who keeps borrowing, and how to hold your terms.' },
  { icon: 'key', title: 'When you’re the one asking', ch: 'Chapters 15 to 17', body: 'Credit, pay, help, fair terms: how to explain your reasons, ask clearly, and decide your plan if the answer is no.' },
  { icon: 'speech', title: 'When you feel guilty saying no', ch: 'Chapter 7', body: 'Favors that turn into debts, "if you loved me, you would," and saying no without a long list of reasons.' },
];

// Page-numbered list: what you can prepare, say or do on that page.
const PAGE_BULLETS = [
  { ch: 7, section: 'When past help is treated as a debt', text: '“After everything I’ve done for you…” The reply that honors the past and still says no, without an argument about who owes whom.' },
  { ch: 8, section: 'The common ways a story changes', text: '“That never happened.” What to say when someone rewrites the past, and how to move the talk to what happens next.' },
  { ch: 9, section: 'Why silence is so hard to sit through', text: 'Two days of silence after you disagree. The one sentence to say, and how to get on with your day without chasing a reply.' },
  { ch: 10, section: 'The slow squeeze', text: 'The boss who keeps moving the goalposts on your raise, and the one sentence that names the original agreement.' },
  { ch: 17, section: 'How to prepare an ask', text: 'Five steps to prepare an ask, from your opening request to the least you will accept.' },
  { ch: 31, section: 'Day 3: One clean no, and one held silence', text: 'How to say no without an excuse or a long explanation, and why extra reasons give people something to argue with.' },
];


export default function HomePage() {
  return (
    <main className="bg-[color:var(--sp2-paper)] pb-24">
      <Hero
        title={
          <span className="block text-[44px] sm:text-[62px] lg:text-[72px] text-[#faf6ee] leading-[1.04]">
            Learn the <span className="italic text-[color:var(--sp2-gold)]">hidden rules of power.</span> Stop being pushed around and start getting what you want.
          </span>
        }
        lead={null}
      />

      {/* A short menu for a long page */}
      <nav className="bg-[color:var(--sp2-paper)] pt-10 sm:pt-14" aria-label="On this page">
        <div className="max-w-[1320px] mx-auto px-5 sm:px-10 flex flex-wrap justify-center gap-x-8 gap-y-2 sp2-ui text-[16px]">
          {[['#learn', 'What you\'ll learn'], ['#example', 'See an example'], ['#order', 'Choose your copy'], ['#faq', 'Questions']].map(([href, label]) => (
            <a key={href} href={href} className="underline underline-offset-[6px] decoration-[color:var(--sp2-line)] hover:decoration-[color:var(--sp2-accent)]">{label}</a>
          ))}
        </div>
      </nav>

      {/* ═══ WHAT THE BOOK TEACHES: icon cards, not paragraphs (sample-page style, 26 Oct) ═══ */}
      <Sheet id="learn" className="pt-16 sm:pt-20 pb-16 scroll-mt-4">
        <Heading kicker="What you'll learn">Seven skills, in the order the book teaches them.</Heading>
        <p className="sp2-lead mt-6 text-[color:var(--sp2-muted)] max-w-[40em]">A practical guide to the unwritten rules that decide who gets their way at work, at home and in relationships.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
          {LEARN.map((l) => (
            <div key={l.title} className="bg-white border border-[color:var(--sp2-line)] rounded-[14px] p-6">
              <img src={`/v2/icons/${l.icon}.png`} alt="" aria-hidden className="w-11 h-11 object-contain" />
              <p className="sp2-display text-[25px] leading-[1.1] mt-3">{l.title.replace(/^How to /, '').replace(/^./, (c) => c.toUpperCase())}</p>
              <p className="text-[16px] leading-snug text-[color:var(--sp2-muted)] mt-2">{l.body}</p>
              <p className="sp2-note !mt-3 !text-[14px]">{l.where}</p>
            </div>
          ))}
          <div className="bg-[color:var(--sp2-night)] text-[#efe7da] rounded-[14px] p-6 flex flex-col justify-center">
            <p className="sp2-display text-[25px] leading-[1.15] text-[#faf6ee]">Not tricks to control people.</p>
            <p className="text-[16px] leading-snug text-[#d8cfc1] mt-2">Every technique is one you could explain openly to the person affected.</p>
          </div>
        </div>
        <div className="mt-12">
          <BuyButton className="w-full sm:w-auto" />
          <BuyNote />
        </div>
      </Sheet>

      {/* ═══ THE BOOK IN NUMBERS (design 3, chosen 26 Oct) ═══ */}
      <section className="bg-[color:var(--sp2-paper)] sp2-grain">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-10 py-14 sm:py-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[['book', '34', 'chapters'], ['compass', '7', 'parts, in order'], ['calendar', '21', 'days of practice'], ['pen', '346', 'pages in print']].map(([icon, n, l]) => (
            <div key={l}>
              <img src={`/v2/icons/${icon}.png`} alt="" aria-hidden className="w-16 h-16 object-contain mx-auto" />
              <p className="sp2-display text-[54px] leading-none mt-3">{n}</p>
              <p className="sp2-ui text-[15px] text-[color:var(--sp2-muted)] mt-1">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ AN EXAMPLE: a real phone with ink notes (design 1, chosen 26 Oct) ═══ */}
      <Night>
        <div id="example" className="grid lg:grid-cols-[400px_1fr] gap-12 lg:gap-16 items-center scroll-mt-4">
          <div className="w-full max-w-[360px] mx-auto rounded-[44px] border-[10px] border-[#2a251e] bg-[color:var(--sp2-paper)] px-5 pt-7 pb-10 text-[color:var(--sp2-ink)] shadow-[0_40px_80px_-30px_#000] sp2-ui">
            <p className="text-center text-[14px] font-semibold text-[#777]">Mom</p>
            <p className="mt-5 bg-[#e3ded5] rounded-[20px] rounded-bl-[6px] px-4 py-3.5 text-[17px] leading-snug">After everything I&apos;ve done for you, you can&apos;t do this one thing?</p>
            <p className="mt-5 ml-10 bg-[color:var(--sp2-ink)] text-[#faf6ee] rounded-[20px] rounded-br-[6px] px-4 py-3.5 text-[17px] leading-snug">You&apos;ve done a lot for me, and I&apos;m grateful. I still can&apos;t do this.</p>
          </div>
          <div>
            <Heading kicker="An example from Chapter 7" dark>How the book handles a guilt trip.</Heading>
            <p className="font-[family-name:var(--font-hand)] text-[30px] leading-[1.2] text-[color:var(--sp2-gold)] mt-7">Past help turned into a debt.<br />Saying no now feels ungrateful.</p>
            <p className="sp2-lead text-[#d8cfc1] mt-6 max-w-[30em]">The reply agrees with the true part (they have helped you) without agreeing you now owe this favor. The book pairs examples like this with an explanation and a reply you can use.</p>
          </div>
        </div>
      </Night>

      {/* ═══ THE MOVES ═══ */}
      <Sheet id="moves" className="pt-20 pb-16 scroll-mt-4">
        <div className="grid lg:grid-cols-12 gap-x-12">
          <div className="lg:col-span-7">
            <Heading kicker="Part II of the book">{MOVE_COUNT} tactics people use to get a yes, and how to answer each one.</Heading>
          </div>
          <div className="lg:col-span-4 lg:col-start-9 lg:pt-16">
            <p className="sp2-lead text-[color:var(--sp2-muted)]">What each one sounds like, and a reply from the book.</p>
            <MarginNote className="mt-3">The first one is open. Tap any other card for its reply.</MarginNote>
          </div>
        </div>
        <div className="mt-12">
          <TacticRolodex openFirst skipDanger more={{ title: '43 pressure moves in all.', text: 'The Tactic Spotter bonus lists every one: what it sounds like, when it is a pattern, and one calm reply.' }} />
        </div>
        <div className="mt-8 max-w-[52em] space-y-2 text-[17px] text-[color:var(--sp2-muted)]">
          <p>One incident is not a pattern, and a reply is not a verdict on someone&apos;s intent. The book shows how to tell a bad moment from a pattern (Chapter 6).</p>
          <p><b className="text-[color:var(--sp2-ink)]">If there are threats, tracking or fear, skip the replies.</b> Start with Chapter 11, When Pressure Becomes Danger, and get help before you change how you respond.</p>
        </div>
      </Sheet>

      {/* ═══ BEFORE AND AFTER (the earlier tab design, restored 26 Oct) ═══ */}
      <Sheet className="pb-16">
        <Heading kicker="Before and after">The usual answer, and the answer from the book.</Heading>
        <div className="mt-12">
          <ScenarioTabs oldLabel="automatic yes" />
        </div>
      </Sheet>
      <Divider />

      {/* ═══ SECOND BUYING OPPORTUNITY ═══ */}
      <Sheet className="pb-24">
        <OfferBox />
      </Sheet>

      {/* ═══ WHAT IT'S FOR ═══ */}
      <Sheet id="inside" className="pt-12 pb-20 scroll-mt-4 !bg-[color:var(--sp2-light)]">
        <Heading kicker="Where you'll use it">At work, at home, with an ex, with clients.</Heading>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10 mt-12">
          {USES.map((u) => (
            <div key={u.title} className="sp2-rule pt-6">
              <img src={`/v2/icons/${u.icon}.png`} alt="" aria-hidden className="w-12 h-12 object-contain" />
              <p className="sp2-display text-[28px] leading-tight mt-3">{u.title}</p>
              <p className="sp2-note !mt-1">{u.ch}</p>
              <p className="text-[color:var(--sp2-muted)] mt-2">{u.body}</p>
            </div>
          ))}
        </div>
      </Sheet>

      {/* ═══ REAL PAGES: the ways a story changes, and a worked exchange with pushback ═══ */}
      <Sheet className="pb-24">
        <div className="max-w-[860px] mx-auto">
          <Heading kicker="Real pages from the book">Read two pages before you buy.</Heading>
          <p className="sp2-lead mt-6 text-[color:var(--sp2-muted)] max-w-[34em]">Word for word. The second is a worked conversation where the other person pushes back. Each preview stops early; the rest is in the book.</p>
          <div className="mt-12 space-y-12">
            {PAGES.map((ex, i) => <SamplePage key={i} ex={ex} i={i} />)}
          </div>
        </div>
      </Sheet>

      {/* ═══ OPEN IT TO THE PAGE YOU NEED ═══ */}
      <Sheet className="pb-24">
        <div className="grid lg:grid-cols-12 gap-x-12 gap-y-10">
          <div className="lg:col-span-4">
            <Heading kicker="Open it to the page you need">What to say, and the page it&apos;s on.</Heading>
            <MarginNote className="mt-6">{HAS_PAGE_NUMBERS ? 'Page numbers from the printed copy.' : 'Chapter numbers from the book.'}</MarginNote>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            {PAGE_BULLETS.map((b) => (
              <div key={`${b.ch}:${b.section}`} className="sp2-rule flex gap-6 py-5">
                <span className="sp2-type text-[20px] text-[color:var(--sp2-oxblood)] whitespace-nowrap pt-1 min-w-[70px]">{pageRefShort(b.ch, b.section)}</span>
                <p className="text-[20px] leading-[1.45]">{b.text}</p>
              </div>
            ))}
            <div className="mt-10">
              <BuyButton className="w-full sm:w-auto" />
              <BuyNote />
            </div>
          </div>
        </div>
      </Sheet>

      {/* ═══ HOW IT WORKS ═══ */}
      <Sheet className="pt-12 pb-20 !bg-[color:var(--sp2-light)]">
        <Heading kicker="How to use it">Read the chapter you need tonight. Practice for 21 days.</Heading>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-8 mt-12">
          {[
            ['Tonight', 'The digital copy arrives by email. Open the Situation Finder at the back and read the chapter for the conversation in front of you.'],
            ['Days 1 to 3', 'The Quick Start: pause before an automatic yes, stop apologizing for things that aren\u2019t your fault, then say one plain no.'],
            ['Days 4 to 21', 'Notice your answers, put time between a request and your decision, make one direct request, and follow through. A few minutes a day, with a journal page for each day.'],
            ['After that', 'When a hard conversation comes up, turn to the chapter that fits, or rehearse it in the app first.'],
          ].map(([when, what], i) => (
            <div key={when} className="sp2-rule pt-5">
              <p className="sp2-display text-[40px] leading-none text-[color:var(--sp2-accent)]">{i + 1}</p>
              <p className="sp2-kicker !mb-1 mt-3">{when}</p>
              <p className="text-[19px] leading-snug">{what}</p>
            </div>
          ))}
        </div>
      </Sheet>

      <Divider />
      {/* ═══ TABLE OF CONTENTS ═══ */}
      <Sheet className="pb-24">
        <div className="max-w-[900px] mx-auto">
          <Heading kicker="Table of contents">34 chapters in seven parts.</Heading>
          <p className="sp2-lead mt-5 text-[color:var(--sp2-muted)]">
            Who really decides, the moves people use and the calm answers, how to make your case and negotiate, how to put it to work with a boss, a client, an ex and your family, and a 21-day practice. Tap a part to see its chapters.
          </p>
          <div className="mt-10">
            {CONTENTS.map((part) => (
              <details key={part.part} className="sp2-rule py-5 group">
                <summary className="cursor-pointer list-none flex items-baseline justify-between gap-6">
                  <span>
                    <span className="sp2-type text-[16px] text-[color:var(--sp2-accent)] mr-4">PART {part.part}</span>
                    <span className="sp2-display text-[26px] sm:text-[30px]">{part.title}</span>
                  </span>
                  <span className="sp2-ui text-[24px] text-[color:var(--sp2-accent)] group-open:rotate-45 transition">+</span>
                </summary>
                <ol className="mt-4 space-y-3">
                  {part.chapters.map((c) => (
                    <li key={c.n} className="flex gap-4">
                      <span className="sp2-type text-[16px] text-[color:var(--sp2-muted)] pt-1 min-w-[28px]">{c.n}</span>
                      <span><b>{c.title}.</b> <span className="text-[color:var(--sp2-muted)]">{c.line}</span></span>
                    </li>
                  ))}
                </ol>
              </details>
            ))}
          </div>
        </div>
      </Sheet>

      <Divider />

      {/* ═══ THE APP ═══ */}
      <Sheet className="pb-24">
        <div className="grid lg:grid-cols-12 gap-x-12 gap-y-8 items-center">
          <div className="lg:col-span-6">
            <Heading kicker="Included: 60 days of the companion app">An app that helps you answer a message and rehearse a hard conversation.</Heading>
            <p className="text-[color:var(--sp2-muted)] mt-6 max-w-[32em]">
              Paste a message or a screenshot and it suggests what tactic might be at work and a calm reply. It can&apos;t tell you someone&apos;s motive. Rehearse the hard conversation with an AI that plays the other person, and follow the 21 days on your phone.
            </p>
            <MarginNote className="mt-4">60 days included. It never renews on its own. Keeping it after that is your choice, at $9.99 a month.</MarginNote>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <img src="/v2/img/app-phone.webp" alt="The companion app: a message, what might be going on, and a calm reply" className="w-[70%] mx-auto drop-shadow-[0_40px_40px_rgba(0,0,0,0.35)]" loading="lazy" />
          </div>
        </div>
      </Sheet>

      {/* ═══ THE FULL OFFER ═══ */}
      <Sheet className="pb-24">
        <StackList />
      </Sheet>
      <Sheet className="pb-24">
        <AboutBook />
      </Sheet>
      <GuaranteeNight />
      <Sheet id="order" className="pt-28 pb-24 scroll-mt-6">
        <OrderCards />
      </Sheet>

      {/* ═══ QUESTIONS ═══ */}
      <Sheet id="faq" className="pb-24 scroll-mt-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="sp2-display text-[40px] sm:text-[56px] leading-[1.05] mb-8">Questions people ask</h2>
          <Faq items={FAQ_FIRST} />
          <details className="mt-6 group">
            <summary className="sp2-ui cursor-pointer list-none text-[17px] font-semibold text-[color:var(--sp2-accent)] underline underline-offset-4">More questions ({FAQ_MORE.length})</summary>
            <div className="mt-4"><Faq items={FAQ_MORE} /></div>
          </details>
        </div>
      </Sheet>

      {/* ═══ CLOSE ═══ */}
      <Sheet className="pb-16">
        <div className="text-center">
          <h2 className="sp2-display text-[44px] sm:text-[72px] lg:text-[84px] leading-[1] max-w-[16ch] mx-auto">Stop being pushed around. Start getting what you want.</h2>
          <p className="sp2-lead mt-6 text-[color:var(--sp2-muted)]">Learn how power and influence really work, answer pressure calmly, and ask for what you want openly.</p>
          <div className="mt-9">
            <BuyButton className="w-full sm:w-auto" />
            <BuyNote />
          </div>
        </div>
        <div className="max-w-3xl mx-auto mt-16 sp2-body">
          <p>
            <span className="sp2-display italic text-[28px]">P.S.</span> Pick the conversation you are dreading next: the boss, the call, the text. Tonight, find its chapter in the Situation Finder, read the reply, and practice it before it happens. If the book isn&apos;t for you, email us within 30 days of delivery and send the book back for a full refund.
          </p>
        </div>
      </Sheet>

      {/* ═══ LAST: THE FREE CHAPTER ═══ */}
      <Sheet id="free-chapter" className="pb-20 scroll-mt-6">
        <div className="max-w-3xl mx-auto sp2-rule pt-12">
          <p className="sp2-kicker">Not ready yet?</p>
          <p className="sp2-display text-[30px] sm:text-[38px] leading-[1.1]">Read a free chapter first.</p>
          <p className="text-[color:var(--sp2-muted)] mt-3 mb-6">Chapter 4, The Voice That Keeps You Stuck: why the perfect reply shows up hours late, and what to do when you keep replaying a conversation. We email it to you.</p>
          <SubscribeForm />
        </div>
      </Sheet>
      <Footer />
      <StickyBuyBar />
    </main>
  );
}
