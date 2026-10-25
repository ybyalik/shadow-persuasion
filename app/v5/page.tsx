/* eslint-disable @next/next/no-img-element */
/**
 * Test version v5: "Who is checking in on you?" (article-style page).
 * The biggest direct-to-consumer book advertisers send cold Facebook traffic to an article that
 * reads like an essay, then reveal the product near the end. This version tests that against the
 * long sales letters: ~2,000 words, one emotion (quiet exhaustion), three usable sentences given
 * away, then the book, the guarantee and the order cards. Headline words come from real posts.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { Mark } from '../v2/_components/editorial';
import { BuyButton, BuyNote } from '../v2/_components/ui';
import { ScenarioTabs, StickyBuyBar } from '../v2/_components/interactive';
import { FaqSection, Footer, GuaranteeNight, Letter, OrderCards, PsLink, PullLine, Sheet, StackList } from '../v2/_components/blocks';
import { NateStoryShort } from '../v2/_components/story';
import { pageRef } from '../v2/_components/pageRef';

export const metadata: Metadata = {
  title: '“Who Is Checking In on Me?” Why the Most Dependable People End Up the Most Exhausted',
  robots: { index: false, follow: false },
};

const LINO = '/v2/lino';

function Sub({ children }: { children: React.ReactNode }) {
  return <h2 className="sp2-display text-[32px] sm:text-[42px] leading-[1.1] mt-16 mb-6">{children}</h2>;
}

/** One of the three sentences, set apart like a note pinned to the page. */
function Sentence({ n, said, when, ch, section }: { n: number; said: string; when: string; ch: number; section: string }) {
  return (
    <div className="my-10 bg-[#fdfbf6] shadow-[0_24px_40px_-28px_rgba(28,27,24,0.55)] px-7 sm:px-10 py-8 -rotate-[0.4deg]">
      <p className="sp2-kicker !mb-2">Sentence {n}</p>
      <p className="sp2-display text-[30px] sm:text-[38px] leading-[1.15]">&ldquo;{said}&rdquo;</p>
      <p className="text-[19px] leading-[1.55] text-[color:var(--sp2-muted)] mt-4">{when}</p>
      <p className="sp2-note mt-3">From the book, {pageRef(ch, section)}.</p>
    </div>
  );
}

export default function V5() {
  return (
    <main className="bg-[color:var(--sp2-paper)] pb-24 md:pb-0">
      {/* A plain masthead, like an essay site rather than a shop */}
      <header className="sp2-grain border-b border-[color:var(--sp2-line)]">
        <div className="max-w-[1320px] mx-auto px-5 sm:px-10 py-5 flex items-center justify-between">
          <span className="sp2-type text-[16px] tracking-[0.14em] text-[color:var(--sp2-accent)]">SHADOW PERSUASION</span>
          <Link href="/v2/checkout" className="sp2-small underline underline-offset-[6px] decoration-[color:var(--sp2-accent)]">
            Get the book
          </Link>
        </div>
      </header>

      <Sheet className="pt-14 sm:pt-20 pb-24">
        <article>
          <div className="max-w-[760px] mx-auto">
            <p className="sp2-kicker">Essay · 9 minute read</p>
            <h1 className="sp2-display text-[40px] sm:text-[60px] leading-[1.04] tracking-[-0.01em]">
              &ldquo;Who is checking in on <em>me</em>?&rdquo; Why the most dependable people end up the most exhausted, and three sentences that change it.
            </h1>
            <p className="sp2-small text-[color:var(--sp2-muted)] mt-6">By Nate Harlan, author of Shadow Persuasion</p>
          </div>

          <img src={`${LINO}/replay.jpg`} alt="A woman lying awake at night, a phone glowing on the nightstand" className="w-full max-w-[980px] mx-auto mt-12 sp2-soft" />

          <Letter className="mt-12">
            <p>It&apos;s Sunday evening, and your phone lights up.</p>
            <p>
              It&apos;s your dad, with a list of errands. Then your sister, asking if you can take the kids Saturday, &ldquo;just this once.&rdquo; Then a work message that starts
              with &ldquo;Quick favor.&rdquo; It is never quick.
            </p>
            <p>You say yes to all three. You always do.</p>
            <p>
              And later, lying in bed, a quiet question surfaces. Not angry, exactly. Just tired. It&apos;s the one I keep seeing, almost word for word, in the forums where people
              like us finally say what we can&apos;t say out loud:
            </p>
          </Letter>

          <PullLine>&ldquo;Who is checking in on me?&rdquo;</PullLine>

          <Letter>
            <p>If you have ever asked yourself that, this is for you.</p>

            <Sub>The dependable one</Sub>
            <p>
              Every family has one. Every office has one. The one who remembers the birthdays, covers the shift, hosts the holiday, drives the relative to the airport and lends the
              money. The one people describe as &ldquo;so easy to work with.&rdquo;
            </p>
            <p>That phrase is a compliment. It is also, very often, a description of how little you cost the people around you.</p>
            <p>
              Nobody plans to use you. That is what makes it so hard to see. Your sister doesn&apos;t sit down and design a guilt trip. She has simply learned, over thirty years,
              that a sigh gets you to cover the family dinner. Your coworker has a list of people she could ask, and you are the one who has never said no.
            </p>
            <p>It happens in slices. Each one is small and easy to justify. It&apos;s only an hour. It&apos;s family. It&apos;s not worth the fight.</p>
            <p>And one day you look up and your whole life is slices.</p>

            <Sub>Why &ldquo;just say no&rdquo; never worked</Sub>
            <p>You have heard it a hundred times. Set boundaries. Say no. Stop caring so much what people think.</p>
            <p>If it were that easy, you would have done it years ago.</p>
            <p>
              The trouble was never knowing that you should say no. The trouble is the moment itself: your mother on the phone, the disappointed sigh, the half-second before you
              answer. In that half-second, something older than your good intentions takes over, and you hear yourself say, &ldquo;Sure, no problem.&rdquo;
            </p>
            <p>
              Most of us learned very young that being agreeable kept us safe, and that other people&apos;s feelings were our job. Those rules made sense once. They still run most of
              our conversations.
            </p>
            <p>
              <strong>Here is what took me years to understand:</strong> the people who never get used are not harder than us, or colder, or more confident. Most of them are
              perfectly kind. They just have a short, calm answer ready, and they say it before the guilt kicks in.
            </p>
            <p>Which means it is not a personality you have to change. It is a few sentences you have to practice.</p>

            <Sub>Three sentences to start with</Sub>
            <p>These come from my book. You can use them this week, today if you like. None of them requires a confrontation.</p>
          </Letter>

          <div className="max-w-[760px] mx-auto">
            <Sentence
              n={1}
              said="Let me check and get back to you."
              when="For the instant yes. You don't have to say no at all. You only change the speed. The pause gives you a moment to notice what you actually want, away from the pressure of someone waiting for your answer."
              ch={31}
              section="Day 1: The pause"
            />
            <Sentence
              n={2}
              said="Thanks for thinking of me, but I can't make it."
              when="For the clean no. No excuse, no list of reasons. If they ask why, “it just doesn't work for me this time” is enough. Every reason past that is something to argue with."
              ch={31}
              section="Day 3: One clean no, and one held silence"
            />
            <Sentence
              n={3}
              said="You've done a lot for me, and I'm grateful. I still can't do this."
              when="For the guilt that follows. Honor what they did, then separate it from today. Don't start listing what you've done for them; that turns it into an argument about who owes whom."
              ch={7}
              section="When past help is treated as a debt"
            />
          </div>

          <Letter>
            <p>Read them again. Notice that none of them is cold. They are the kind of thing a polite person says. The only difference is that you say them, instead of the yes.</p>
            <p>
              And notice the part that will feel hardest: <em>then stop talking.</em> The silence after a calm no is exactly where most of us cave. It is also where everything
              changes.
            </p>

            <Sub>Why reading this won&apos;t be enough (and what will)</Sub>
            <p>You might try one of those sentences this week and feel the old reflex win anyway. That is normal. A sentence you read once won&apos;t come out under pressure.</p>
            <p>
              Practice is what changes it. Small moments first, a sales call, a coworker, a friend, until the new answer is familiar. Then the bigger ones. Then your mother. That is
              how I finally got there myself.
            </p>
          </Letter>

          <div className="mt-16 mb-6">
            <NateStoryShort />
          </div>

          <Letter>
            <Sub>What I wrote down</Sub>
            <p>
              The notes became a book: <strong>Shadow Persuasion: The Hidden Rules of Power.</strong> It is built around the moments people like us actually face,
              with the exact words for each.
            </p>
            <p>Tap a situation to see the difference between the old answer and the calm one:</p>
          </Letter>
          <div className="max-w-[980px] mx-auto mt-10">
            <ScenarioTabs />
          </div>

          <Letter className="mt-16">
            <p>Inside you will find:</p>
          </Letter>
          <ul className="max-w-[680px] mx-auto mt-4 space-y-3 text-[20px] sm:text-[21px] leading-[1.5]">
            {[
              'The everyday pressure patterns, from the guilt trip and the changing story to the slow squeeze, each with calm words to answer it (Part II).',
              'How to ask for what you want in the open: a raise, credit for your work, help with an aging parent, fair terms (Parts III to V).',
              'Words for the push-back too: the sulk, the second ask, the call to a sibling, and "you\'ve changed."',
              'A 21-day reset: one small practice a day, a few seconds in the moment and a few minutes of writing at night (Part VII).',
              'A printable journal, three bonuses, and 60 days of an app that reads a message and drafts a calm reply.',
            ].map((t) => (
              <li key={t} className="flex gap-4 items-start">
                <img src="/v2/ink/check.png" alt="" aria-hidden className="w-7 h-7 flex-shrink-0 mt-1" />
                <span>{t}</span>
              </li>
            ))}
          </ul>

          <div className="max-w-[760px] mx-auto text-center mt-16">
            <img src="/v2/img/hero-cutout.webp" alt="The Shadow Persuasion book with The 21-Day Power Reset Journal open beside it" className="w-full max-w-[560px] mx-auto" />
            <p className="sp2-display text-[30px] sm:text-[40px] leading-[1.15] mt-8">
              You have spent years checking in on everyone else.{' '}
              <span className="relative inline-block italic">
                This one is for you.
                <Mark name="underline" red className="left-0 -bottom-2 w-full h-3" />
              </span>
            </p>
            <div className="mt-8">
              <BuyButton className="w-full sm:w-auto" />
              <BuyNote />
            </div>
          </div>
        </article>
      </Sheet>

      <Sheet className="pb-24">
        <StackList />
      </Sheet>
      <GuaranteeNight />
      <Sheet id="order" className="pt-28 pb-24 scroll-mt-6">
        <OrderCards />
      </Sheet>
      <Sheet className="pb-24">
        <FaqSection />
        <div className="max-w-3xl mx-auto mt-20 sp2-body">
          <p>
            <span className="sp2-display italic text-[28px]">P.S.</span> Next Sunday, when the phone lights up, try sentence one. &ldquo;Let me check and get back to you.&rdquo;
            That&apos;s all. Then, if you want the rest, the book is here, and the 30-day guarantee means it costs you nothing to find out. <PsLink />
          </p>
        </div>
      </Sheet>
      <Footer />
      <StickyBuyBar />
    </main>
  );
}
