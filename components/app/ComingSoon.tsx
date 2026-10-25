'use client';

/* Shown on pages that belong to the new edition of the book (lib/edition.ts, IS_V3)
   when the app still follows the current edition. */

import { ArrowRight } from 'lucide-react';
import { Button, Card, PageHeader } from '@/components/app/ui';

export function ComingSoon({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <PageHeader kicker="Coming soon" title={title} subtitle={body} />
      <Card>
        <p className="text-[16px] leading-relaxed">This page arrives with the next edition of the book. Everything else in the app works as usual.</p>
        <div className="mt-5">
          <Button href="/app">
            Back to Today <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
