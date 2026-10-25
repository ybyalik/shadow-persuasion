'use client';

import { useParams } from 'next/navigation';
import { TalkItThroughView } from '@/components/app/StrategicChat';

export default function TalkItThroughSessionPage() {
  const params = useParams();
  const id = typeof params.id === 'string' && params.id !== 'new' ? params.id : undefined;
  return <TalkItThroughView sessionId={id} />;
}
