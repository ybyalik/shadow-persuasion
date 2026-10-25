import { redirect } from 'next/navigation';

/* The old "Defense" page is now part of Decode a Message. */
export default function DefensePage() {
  redirect('/app/analyze');
}
