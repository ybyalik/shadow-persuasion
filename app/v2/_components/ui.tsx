'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

/**
 * Wraps content that may gently fade in. Text is never hidden: paragraphs and
 * headings render immediately (readers 35 to 60+ should never see a blank
 * space waiting for an animation). Only `image` blocks get a slow reveal.
 */
export function Reveal({
  children,
  className,
  image = false,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  image?: boolean;
}) {
  if (!image) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0.001, scale: 1.015 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '0px 0px -80px 0px' }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

/** The one small label a section may have. */
export function Kicker({ children, className = '', dark = false }: { children: React.ReactNode; className?: string; dark?: boolean }) {
  return <p className={`sp2-kicker mb-4 ${dark ? 'on-dark' : ''} ${className}`}>{children}</p>;
}

export function BuyButton({
  label = 'Get the paperback, $67',
  gold = false,
  full = false,
  href = '/v2/checkout',
  className = '',
}: {
  label?: string;
  gold?: boolean;
  full?: boolean;
  href?: string;
  className?: string;
}) {
  return (
    <Link href={href} className={`sp2-btn ${gold ? 'sp2-btn-gold' : ''} ${full ? 'w-full' : ''} ${className}`}>
      {label}
    </Link>
  );
}

/** The one-line reassurance under every buy button. */
export function BuyNote({ dark = false }: { dark?: boolean }) {
  return (
    <p className={`sp2-small mt-3 ${dark ? 'text-[#d8cfc1]' : 'text-[color:var(--sp2-muted)]'}`}>
      Free US shipping · Digital copy tonight · 30-day money-back guarantee
    </p>
  );
}

/* Retired from the page design (kept so older imports compile). */
export function DocDivider({ text }: { text: string }) {
  return <hr aria-label={text} className="sp2-rule border-0 max-w-6xl mx-auto" />;
}
export function Stamp({ children }: { children: React.ReactNode; color?: string; rotate?: number; className?: string; delay?: number }) {
  return <span className="sr-only">{children}</span>;
}
