/**
 * Test version v4: "The notebook" (story lead).
 * Opens as a personal letter from Nate Harlan (pen name): his mother's notebook of things she never
 * said, his realisation that he was the same, and what he learned (Conroy / Caples story lead,
 * Brunson's epiphany bridge). The product appears inside the story as the answer, then the page
 * shows it working, names the method, and makes the offer.
 */
import type { Metadata } from 'next';
import { Hero, MarginNote, Notebook } from '../v2/_components/editorial';
import { ForYou, InterceptedMessage, ResetPath, ScenarioTabs, StickyBuyBar, TacticRolodex, WayOut } from '../v2/_components/interactive';
import {
  Close,
  DoesntNeed,
  Fascinations,
  FaqSection,
  Footer,
  GuaranteeNight,
  Heading,
  InlineBuy,
  Letter,
  LetterHead,
  Night,
  OrderCards,
  PsLink,
  PullLine,
  Sheet,
  Signature,
  StackList,
  WhyThePrice,
} from '../v2/_components/blocks';
import { NateStory } from '../v2/_components/story';
import { DOESNT_NEED, FASCINATIONS } from '../v2/_components/copy';

export const metadata: Metadata = {
  title: 'My Mother Kept a Notebook of Everything She Never Said | Shadow Persuasion: The Hidden Rules of Power',
  robots: { index: false, follow: false },
};

export default function V4() {
  return (
    <main className="bg-[color:var(--sp2-paper)] pb-24 md:pb-0">
      <Hero
        pre="A letter from Nate Harlan"
        title={
          <>
            <span className="block text-[40px] sm:text-[60px] lg:text-[68px] text-[#faf6ee] leading-[1.02]">My mother kept a notebook</span>
            <span className="block italic text-[46px] sm:text-[74px] lg:text-[84px] text-[color:var(--sp2-gold)] mt-2 leading-[1]">of everything she never said.</span>
          </>
        }
        lead={<>Forty years of replies she was too kind to say out loud. I found it the week we moved her out of the house. This book is what I wish I could have handed her.</>}
        img="/v2/img/hero-cutout.webp"
        imgAlt="The Shadow Persuasion book with The 21-Day Power Reset Journal open beside it"
      />

      {/* ═══ The story ═══ */}
      <Sheet className="pt-24 sm:pt-32 pb-10">
        <Letter>
          <p className="sp2-display italic text-[30px]">Dear friend,</p>
        </Letter>
        <div className="mt-8">
          <NateStory />
        </div>
        <Signature />
      </Sheet>

      {/* ═══ Self-recognition ═══ */}
      <Sheet className="pt-16 pb-6">
        <Letter>
          <p>Before I show you what&apos;s inside, I&apos;d like you to do something my mother never did. Look at the last twelve months, honestly, and count.</p>
        </Letter>
      </Sheet>
      <Notebook />

      {/* ═══ The moves ═══ */}
      <Sheet className="pt-6 pb-20">
        <LetterHead kicker="What I found">It is the same few moves, over and over.</LetterHead>
        <Letter>
          <p>When I lined up every guilt trip from my mother&apos;s notebook next to every one from my phone, I saw it. Different people, different decades, the same few moves.</p>
          <p>The guilt trip. The sulk that lasts until you apologize. The compliment that arrives right before the favor. The deadline from nowhere. The slow squeeze, where one yes quietly becomes your job.</p>
          <p>Each one works for a reason. And each one has a calm answer. Tap any of them:</p>
        </Letter>
        <div className="mt-14">
          <TacticRolodex />
        </div>
        <MarginNote className="mt-4 text-center">Part II of the book, Stop Unfair Pressure, covers them in Chapters 6 to 11.</MarginNote>
      </Sheet>

      {/* ═══ The answer, demonstrated ═══ */}
      <Night>
        <Heading kicker="What her notebook needed" dark>
          One sentence. Three hooks. A calm way out.
        </Heading>
        <p className="sp2-lead mt-6 text-[#e6ddcf] max-w-[36em]">
          Here is a message my mother could have written in her notebook, taken apart the way the book teaches you to. Choose a reply and see why it works.
        </p>
        <div className="mt-12">
          <InterceptedMessage />
        </div>
      </Night>

      <Sheet className="pt-28 pb-24">
        <Heading kicker="Before and after">Same moment. Different answer.</Heading>
        <div className="mt-12">
          <ScenarioTabs />
        </div>
      </Sheet>

      {/* ═══ Why knowing isn't enough: the method ═══ */}
      <Sheet className="pb-16">
        <LetterHead kicker="Why reading isn't enough">My mother knew the right words. She wrote them down.</LetterHead>
        <Letter>
          <p>That is the cruel part. She knew. She had the perfect answer, in her own handwriting, forty years of them. What she never had was the moment when the words came out of her mouth instead of her pen.</p>
          <p>
            That is a skill, and skills come from practice, not insight. So the book ends with a 21-day reset: one small practice a day, a few seconds in the moment and a few minutes of writing at night, in low-stakes
            moments first. By the time your sister calls about the holidays, the calm answer is already familiar.
          </p>
        </Letter>
        <div className="mt-16">
          <WayOut />
        </div>
        <div className="mt-24">
          <ResetPath />
        </div>
      </Sheet>

      <Sheet className="pb-24">
        <LetterHead kicker="The part other books leave out">And when they push back?</LetterHead>
        <Letter>
          <p>
            When I held that first calm no with my brother, he didn&apos;t speak to me for nine days. Nobody had warned me about that part. The people who did well out of the old
            you will test the new one: the second ask, the sulk, the public ambush at the dinner table, and sooner or later, &ldquo;you&apos;ve changed.&rdquo;
          </p>
          <p>The book prepares you for that part too, from the sulk (Chapter 9) to the no that comes with a cost (Chapter 28), so the first push-back doesn&apos;t send you straight back to the notebook.</p>
        </Letter>
        <PullLine>The people who benefit from the old you will adjust, or they won&apos;t. The people who love you will usually be glad.</PullLine>
        <InlineBuy line="Start the reset this week." />
      </Sheet>

      <Sheet className="pt-6 pb-24">
        <LetterHead kicker="Open it to the page you need">Here is some of what you&apos;ll find inside.</LetterHead>
        <Fascinations items={FASCINATIONS} />
      </Sheet>

      <Sheet className="pb-24">
        <LetterHead kicker="What it doesn't take">You don&apos;t have to become someone else.</LetterHead>
        <DoesntNeed items={DOESNT_NEED} />
      </Sheet>

      <Sheet className="pt-6 pb-24">
        <ForYou />
      </Sheet>

      {/* ═══ The offer ═══ */}
      <Sheet className="pb-24">
        <StackList />
      </Sheet>
      <Sheet className="pb-24">
        <WhyThePrice />
      </Sheet>
      <GuaranteeNight />
      <Sheet id="order" className="pt-28 pb-24 scroll-mt-6">
        <OrderCards />
      </Sheet>
      <Sheet className="pb-24">
        <FaqSection />
      </Sheet>
      <Sheet className="pb-10">
        <Close
          ps={
            <>
              <p>
                <span className="sp2-display italic text-[28px]">P.S.</span> My mother is eighty now. She still keeps the notebook in the kitchen drawer. These days, she tells me,
                it&apos;s mostly grocery lists.
              </p>
              <p>
                <span className="sp2-display italic text-[28px]">P.P.S.</span> Try the book and the reset for 30 days. If it isn&apos;t for you, email us and you get a full
                refund. No forms, and no guilt trip. <PsLink />
              </p>
            </>
          }
        />
      </Sheet>
      <Footer />
      <StickyBuyBar />
    </main>
  );
}
