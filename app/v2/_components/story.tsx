/**
 * Nate Harlan's story (pen-name author). A lived-experience story: no credentials,
 * no client results, no claims a reader could be misled by. Used in full on /v4
 * and in short form on /v3 and /v5.
 */

import { Letter, PullLine } from './blocks';

export function NateStory() {
  return (
    <>
      <Letter>
        <p>My mother kept a spiral notebook in the kitchen drawer, under the takeout menus and the spare batteries.</p>
        <p>I found it the week we moved her out of the house she had lived in for forty-one years. I thought it was recipes.</p>
        <p>It wasn&apos;t.</p>
        <p>Page after page of sentences, in her neat schoolteacher handwriting. Some of them dated. Some underlined twice.</p>
        <p className="sp2-note !text-[19px] !leading-[1.6] pl-5 border-l-2 border-[color:var(--sp2-line)]">
          &ldquo;Carol, I can&apos;t host Christmas this year. Someone else needs to take a turn.&rdquo;
          <br />
          &ldquo;No, Dennis. Not until you pay back the last one.&rdquo;
          <br />
          &ldquo;Please don&apos;t speak to me like that in front of the children.&rdquo;
          <br />
          &ldquo;I&apos;m tired.&rdquo;
        </p>
        <p>Forty years of answers she never gave. I think she wrote them at night, after everyone was asleep. The perfect reply, and nobody to give it to.</p>
        <p>Everyone who knew my mother called her a saint. She hosted every holiday for thirty-one years. She drove her sister to chemotherapy twice a week while working full time. She lent her brother money he never once paid back, and when he asked again, she lent him more.</p>
        <p>She was the most loved person I have ever known.</p>
        <p>She was also the most used.</p>
        <p>I sat on the kitchen floor with that notebook for a long time. Somewhere in the second hour, I realized something that made my stomach drop.</p>
        <p>I had a notebook too.</p>
        <p>
          Mine was the notes app on my phone. Drafts of texts I never sent. Replies to my boss I wrote at two in the morning and deleted at seven. The thing I should have said to my
          brother the third time he &ldquo;just needed a few hundred till Friday.&rdquo;
        </p>
        <p>I was forty-four. I was the reliable one at work, which meant I did the job of three people for the pay of one. I was the one my family called when something needed handling. I was, by every account, a nice guy.</p>
        <p>And I was exactly as easy to use as she was.</p>
      </Letter>

      <PullLine>Nobody takes your life in one piece. They take it in reasonable slices, and you hand most of them over yourself, with a smile.</PullLine>

      <Letter>
        <p>So I did what I always do when something scares me. I read everything.</p>
        <p>
          Books on persuasion and negotiation. Research on guilt, and on the &ldquo;fawn&rdquo; response, and on why kind people cave under pressure. Memoirs by people who got free of
          controlling families. Old sales manuals, which, it turns out, describe the guilt trip better than any psychology book.
        </p>
        <p>And I noticed something nobody had ever told me.</p>
        <p>The people who never get used are not harder than us. They aren&apos;t meaner, or colder, or more confident. Most of them are perfectly kind.</p>
        <p>
          <strong>They just have a short, calm answer ready. And they say it before the guilt kicks in.</strong>
        </p>
        <p>That was the whole difference.</p>
        <p>
          The pressure people put on us isn&apos;t random. It is the same handful of moves, over and over: the guilt trip, the sulk, the deadline from nowhere, the compliment right
          before the favor, the slow squeeze where one yes quietly becomes your job. Once I could see the move, I could answer it. And once I had an answer, I could practice it.
        </p>
        <p>
          I started small. I let a sales call end without apologizing. I said &ldquo;let me check and get back to you&rdquo; instead of yes. I let a pause sit
          without rushing to fill it. It felt ridiculous. It also worked.
        </p>
        <p>A few weeks later my brother called. He needed a few hundred till Friday.</p>
        <p>&ldquo;I&apos;m not able to lend more until the earlier loans are sorted out,&rdquo; I said. And then I stopped talking.</p>
        <p>The silence was terrible. He sighed. He told me how hard things were. I said, &ldquo;I know it&apos;s hard. I&apos;m still not able to.&rdquo;</p>
        <p>He didn&apos;t speak to me for nine days.</p>
        <p>On the tenth day he called about something else entirely, as if nothing had happened. He has not asked me for money since.</p>
        <p>
          I wrote everything down. Every move, and the calm answer that stopped it. Every small drill that made the answer come out on its own, without my heart pounding. Friends
          asked for copies. Then friends of friends. That pile of notes became this book.
        </p>
        <p>I&apos;m not a therapist, and this isn&apos;t therapy. I&apos;m a man who spent forty-four years being easy to use, and the son of a woman who spent seventy-eight.</p>
        <p>Last spring I read my mother the chapter on guilt trips. She listened all the way through. Then she laughed and said, &ldquo;Where was this in 1979?&rdquo;</p>
        <p>I wrote it for her. I wrote it for you.</p>
      </Letter>
    </>
  );
}

/** The same story in about 250 words. */
export function NateStoryShort() {
  return (
    <Letter>
      <p>When we moved my mother out of the house she had lived in for forty-one years, I found a spiral notebook in her kitchen drawer.</p>
      <p>
        It was full of sentences she never said. &ldquo;Carol, I can&apos;t host Christmas this year.&rdquo; &ldquo;No, Dennis. Not until you pay back the last one.&rdquo;
        &ldquo;I&apos;m tired.&rdquo; Forty years of answers, written at night, after everyone was asleep.
      </p>
      <p>Everyone called her a saint. She was also the most used person I have ever known.</p>
      <p>And sitting on her kitchen floor, I realized I had a notebook too: the notes app on my phone, full of replies to my boss and my brother that I never sent.</p>
      <p>
        So I read everything I could find on persuasion, negotiation, guilt and why kind people cave under pressure. What I found surprised me. The people who never get used are not
        harder than us. <strong>They just have a short, calm answer ready, and they say it before the guilt kicks in.</strong>
      </p>
      <p>I practiced those answers, small moments first, until they came out on their own. I wrote it all down. That became this book.</p>
      <p>I&apos;m not a therapist. I&apos;m a man who spent forty-four years being easy to use, and the son of a woman who spent seventy-eight.</p>
    </Letter>
  );
}
