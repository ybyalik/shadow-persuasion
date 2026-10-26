/**
 * A real page from the book, shown as a printed page (the "Read it before you buy it" section on /b/ pages).
 * Excerpts are copied word for word from the chapter files in book-v3/drafts. If the book text changes,
 * update them in app/p/data. `ch` + `section` name the chapter and the exact `##` heading; `sub` is the
 * `###` heading inside it, when there is one.
 */
import { pageRef, pageRefShort } from '../_sales/pageRef';

export type ExcerptBlock =
  | { kind: 'p'; text: string }
  /** A "Try saying" box: one or more lines the reader can use. */
  | { kind: 'say'; lines: string[] }
  /** Dialogue: who is speaking (or '' for an unlabeled line) and what they say. */
  | { kind: 'talk'; lines: { who: string; text: string }[] };

export type Excerpt = { ch: number; chapterTitle: string; section: string; sub?: string; blocks: ExcerptBlock[] };

/** Design C (chosen 26 Oct): a printed page lifted off a short stack, with a running head and page number. */
export function SamplePage({ ex }: { ex: Excerpt; i?: number }) {
  const page = pageRefShort(ex.ch, ex.section).replace(/^p\. /, '');
  return (
    <article
      className="relative text-[color:var(--sp2-ink)] rounded-[2px] px-6 sm:px-12 pt-8 sm:pt-10 pb-7 font-[family-name:var(--font-sp2-display)]"
      style={{
        background: 'radial-gradient(ellipse at 30% 20%, #fffdf6 0, #f3ecdd 70%, #e3d9c5 100%)',
        boxShadow: '0 0 0 1px #d8cfbd, 8px 8px 0 -2px #efe7d6, 8px 8px 0 -1px #d1c7b3, 16px 16px 0 -4px #e9e0cd, 0 50px 80px -30px rgba(0,0,0,0.7)',
      }}
    >
      <div className="flex justify-between text-[13px] tracking-[0.18em] uppercase text-[#6b6257]">
        <span>{page}</span>
        <span>Chapter {ex.ch}</span>
      </div>
      <h3 className="text-[26px] sm:text-[30px] font-medium leading-tight mt-6">{ex.sub ?? ex.section}</h3>
      <div className="mt-3 text-[19px] sm:text-[21px] leading-[1.55] text-justify [hyphens:auto] [&>p+p]:indent-[1.4em]">
        {ex.blocks.map((b, k) => {
          if (b.kind === 'p') return <p key={k}>{b.text}</p>;
          if (b.kind === 'say')
            return (
              <p key={k} className="!indent-0 my-3 pl-[1.4em] italic">
                {b.lines.join(' ')}
              </p>
            );
          return b.lines.map((l, n) => (
            <p key={`${k}-${n}`}>
              {l.who && <i>{l.who}: </i>}
              {l.text}
            </p>
          ));
        })}
      </div>
      <p className="sp2-note mt-6 text-center !text-[14px]">From {pageRef(ex.ch, ex.section)}.</p>
    </article>
  );
}
