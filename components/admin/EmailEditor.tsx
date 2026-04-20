'use client';

/**
 * Three-tab email body editor: Visual (iframe with designMode),
 * HTML (raw source textarea), Preview (live iframe).
 *
 * The Visual tab is an iframe in `designMode='on'` rather than a
 * rich-text component like TipTap. Why: email HTML uses tables,
 * inline styles, brand colors, and nested divs that a
 * schema-based editor would strip on the first keystroke. An
 * iframe is just a browser rendering your actual HTML, so all
 * of that survives.
 *
 * Toolbar (bold, italic, link, lists) uses `document.execCommand`
 * on the iframe's contentDocument. It's deprecated but every
 * browser still implements it and the Selection API replacements
 * aren't viable for this use case yet.
 *
 * Tabs share one canonical value. Switching Visual → HTML
 * serializes the iframe's current HTML out. Switching HTML →
 * Visual re-writes the iframe with the new source.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Code as CodeIcon,
  Eye,
  Pencil,
} from 'lucide-react';

type Mode = 'visual' | 'html' | 'preview';

interface Props {
  value: string;
  onChange: (next: string) => void;
  /** Variables substituted into the preview iframe (sample values). */
  previewVars?: Record<string, string>;
}

/**
 * Serialize a full HTML document out of an iframe, preserving
 * doctype so email clients parse it as HTML5.
 */
function serializeDocument(doc: Document): string {
  const dt = doc.doctype ? `<!DOCTYPE ${doc.doctype.name}>\n` : '';
  return dt + doc.documentElement.outerHTML;
}

/**
 * Write HTML into an iframe and switch it to design mode. If the
 * source already contains a full <!DOCTYPE><html> document, it's
 * written verbatim. If it's body-only (fragment), we wrap it in a
 * minimal shell so designMode has something to attach to.
 */
function loadIntoIframe(iframe: HTMLIFrameElement, html: string) {
  const doc = iframe.contentDocument;
  if (!doc) return;
  const looksFull = /<html[\s>]/i.test(html) && /<body[\s>]/i.test(html);
  const payload = looksFull
    ? html
    : `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`;
  doc.open();
  doc.write(payload);
  doc.close();
  // designMode must be set AFTER the document finishes loading.
  // Setting it synchronously right after close() works in every
  // modern browser (the doc.write/close above is synchronous).
  doc.designMode = 'on';
}

export default function EmailEditor({ value, onChange, previewVars = {} }: Props) {
  const [mode, setMode] = useState<Mode>('visual');
  // Local copy of the HTML — typing in HTML mode updates this without
  // re-rendering the Visual iframe on every keystroke.
  const [htmlDraft, setHtmlDraft] = useState(value);
  const visualIframeRef = useRef<HTMLIFrameElement>(null);
  // Track whether we're writing to the iframe ourselves (programmatic),
  // so we don't race with the user's input event.
  const skipNextInputRef = useRef(false);

  // Sync external value changes into our local draft. This fires when
  // a different template is loaded or when the parent swaps the value.
  useEffect(() => {
    setHtmlDraft(value);
  }, [value]);

  /**
   * Push the iframe's current HTML out to the parent. Called on
   * input events, toolbar actions, and tab changes.
   */
  const flushFromIframe = useCallback(() => {
    const iframe = visualIframeRef.current;
    if (!iframe?.contentDocument) return;
    const html = serializeDocument(iframe.contentDocument);
    setHtmlDraft(html);
    onChange(html);
  }, [onChange]);

  // When switching into Visual mode, load the current draft into
  // the iframe and wire up input listeners. When switching out,
  // flush the content back to the parent.
  useEffect(() => {
    if (mode !== 'visual') return;
    const iframe = visualIframeRef.current;
    if (!iframe) return;

    skipNextInputRef.current = true;
    loadIntoIframe(iframe, htmlDraft);

    const doc = iframe.contentDocument;
    if (!doc) return;

    // All user edits flow through the `input` event on the body.
    const onInput = () => {
      if (skipNextInputRef.current) {
        skipNextInputRef.current = false;
        return;
      }
      flushFromIframe();
    };
    doc.body.addEventListener('input', onInput);
    // execCommand-driven changes (bold/italic via toolbar) also fire input,
    // but some Safari versions skip it for certain commands. Also listen
    // for selection/keyup as a safety net.
    doc.addEventListener('keyup', onInput);

    return () => {
      doc.body.removeEventListener('input', onInput);
      doc.removeEventListener('keyup', onInput);
    };
    // We want this to re-run whenever we ENTER the visual tab.
    // htmlDraft isn't a dep — when it changes from inside the iframe,
    // we don't want to re-write it (would lose the cursor).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, flushFromIframe]);

  /** Run an execCommand on the iframe's document. */
  function exec(cmd: string, arg?: string) {
    const iframe = visualIframeRef.current;
    const doc = iframe?.contentDocument;
    if (!doc) return;
    iframe?.contentWindow?.focus();
    doc.execCommand(cmd, false, arg);
    flushFromIframe();
  }

  function setLink() {
    const iframe = visualIframeRef.current;
    const doc = iframe?.contentDocument;
    if (!doc) return;
    const sel = doc.getSelection();
    if (!sel || sel.rangeCount === 0) {
      alert('Select some text first, then click the link button.');
      return;
    }
    const url = prompt('Link URL:', 'https://');
    if (url === null) return;
    if (url === '') {
      exec('unlink');
    } else {
      exec('createLink', url);
    }
  }

  function switchMode(next: Mode) {
    if (next === mode) return;
    // Leaving Visual — serialize out before the iframe unmounts.
    if (mode === 'visual') flushFromIframe();
    setMode(next);
  }

  function renderPreviewHtml(src: string): string {
    return src.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, name) => {
      return previewVars[name] ?? match;
    });
  }

  return (
    <div className="border border-gray-300 dark:border-[#D4A017]/30">
      {/* Tab strip */}
      <div className="flex border-b border-gray-300 dark:border-[#D4A017]/30 bg-gray-50 dark:bg-[#0A0A0A]">
        <TabButton
          active={mode === 'visual'}
          onClick={() => switchMode('visual')}
          icon={<Pencil className="h-3 w-3" />}
        >
          Visual
        </TabButton>
        <TabButton
          active={mode === 'html'}
          onClick={() => switchMode('html')}
          icon={<CodeIcon className="h-3 w-3" />}
        >
          HTML
        </TabButton>
        <TabButton
          active={mode === 'preview'}
          onClick={() => switchMode('preview')}
          icon={<Eye className="h-3 w-3" />}
        >
          Preview
        </TabButton>
      </div>

      {/* Visual — designMode iframe + toolbar */}
      {mode === 'visual' && (
        <>
          <div className="flex gap-1 p-2 border-b border-gray-300 dark:border-[#D4A017]/20 bg-gray-50 dark:bg-[#0A0A0A] flex-wrap">
            {/* onMouseDown preventDefault — stops the button from stealing
                focus out of the iframe before execCommand runs. */}
            <ToolbarBtn onMouseDown={(e) => e.preventDefault()} onClick={() => exec('bold')} title="Bold">
              <Bold className="h-3.5 w-3.5" />
            </ToolbarBtn>
            <ToolbarBtn onMouseDown={(e) => e.preventDefault()} onClick={() => exec('italic')} title="Italic">
              <Italic className="h-3.5 w-3.5" />
            </ToolbarBtn>
            <ToolbarBtn
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => exec('insertUnorderedList')}
              title="Bullet list"
            >
              <List className="h-3.5 w-3.5" />
            </ToolbarBtn>
            <ToolbarBtn
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => exec('insertOrderedList')}
              title="Numbered list"
            >
              <ListOrdered className="h-3.5 w-3.5" />
            </ToolbarBtn>
            <ToolbarBtn onMouseDown={(e) => e.preventDefault()} onClick={setLink} title="Insert/edit link">
              <LinkIcon className="h-3.5 w-3.5" />
            </ToolbarBtn>
            <span className="ml-auto text-[10px] text-gray-500 dark:text-[#F4ECD8]/50 font-mono px-2 self-center">
              Click into the preview to edit. Tables, colors, and styles are preserved.
            </span>
          </div>
          <iframe
            ref={visualIframeRef}
            title="Email visual editor"
            className="w-full min-h-[480px] bg-white border-0"
          />
        </>
      )}

      {/* HTML — raw source textarea */}
      {mode === 'html' && (
        <textarea
          value={htmlDraft}
          onChange={(e) => {
            setHtmlDraft(e.target.value);
            onChange(e.target.value);
          }}
          className="w-full min-h-[480px] p-3 bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-[#F4ECD8] text-xs font-mono focus:outline-none resize-y"
          spellCheck={false}
        />
      )}

      {/* Preview — live iframe with sample variables filled in */}
      {mode === 'preview' && (
        <div className="p-3 bg-gray-100 dark:bg-[#0A0A0A]">
          <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500 dark:text-[#F4ECD8]/50 mb-2">
            Preview rendered with sample variable values. Unfilled variables show as &#x7B;&#x7B;name&#x7D;&#x7D;.
          </p>
          <iframe
            srcDoc={renderPreviewHtml(value)}
            title="Email preview"
            className="w-full min-h-[480px] bg-white border border-gray-300 dark:border-[#D4A017]/20"
            sandbox=""
          />
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors ${
        active
          ? 'border-[#D4A017] text-[#D4A017] bg-white dark:bg-[#111]'
          : 'border-transparent text-gray-600 dark:text-[#F4ECD8]/60 hover:text-gray-900 dark:hover:text-[#F4ECD8]'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function ToolbarBtn({
  onClick,
  onMouseDown,
  title,
  children,
}: {
  onClick: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={onMouseDown}
      title={title}
      className="p-1.5 rounded border border-transparent text-gray-700 dark:text-[#F4ECD8]/70 hover:bg-gray-200 dark:hover:bg-[#222]"
    >
      {children}
    </button>
  );
}
