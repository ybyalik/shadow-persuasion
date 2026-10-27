/**
 * The three cart-recovery reminders for people who typed their email at /checkout but didn't
 * pay (sent by app/api/cron/sp2-cart-recovery, 1 hour, 1 day and 3 days after they left).
 * Placeholders: {{checkout_link}} (keeps their edition), {{chapter_link}} (the free chapter).
 * Plain facts only: no deadline, no discount, no invented reviews.
 */

export type CartRecoveryEmail = { step: 1 | 2 | 3; afterHours: number; subject: string; preview: string; html: string; text: string };

export const CART_RECOVERY_EMAILS: CartRecoveryEmail[] = [
  {
    step: 1,
    afterHours: 1,
    subject: 'You didn’t finish your order',
    preview: 'Here’s the link back, with your edition saved.',
    html: `<p>Hi,</p>
<p>You started an order for <em>Shadow Persuasion: The Hidden Rules of Power</em> but didn’t finish it. If the page gave you trouble, or you just got pulled away, here’s the link back. The edition you picked is saved.</p>
<p><a href="{{checkout_link}}"><b>Finish your order</b></a></p>
<p>A quick reminder of what comes with it:</p>
<ul>
<li>The book, shipped free in the US.</li>
<li>The digital edition by email the moment you order, so you can start tonight.</li>
<li>The 21-Day Power Reset Journal and three printable guides.</li>
<li>60 days of the companion app. It never renews on its own.</li>
</ul>
<p>If something stopped you, just reply to this email and tell me what it was.</p>
<p>Nate</p>`,
    text: `Hi,

You started an order for Shadow Persuasion: The Hidden Rules of Power but didn't finish it. If the page gave you trouble, or you just got pulled away, here's the link back. The edition you picked is saved.

Finish your order: {{checkout_link}}

A quick reminder of what comes with it:
- The book, shipped free in the US.
- The digital edition by email the moment you order, so you can start tonight.
- The 21-Day Power Reset Journal and three printable guides.
- 60 days of the companion app. It never renews on its own.

If something stopped you, just reply to this email and tell me what it was.

Nate`,
  },
  {
    step: 2,
    afterHours: 24,
    subject: 'Four questions people ask before buying',
    preview: 'Returns, delivery, Amazon, and whether it’s manipulation.',
    html: `<p>Hi,</p>
<p>When someone stops at checkout, it’s usually one of these.</p>
<p><b>What if it isn’t useful to me?</b><br>You have 30 days from delivery. Email me, send the book back, and you get a full refund.</p>
<p><b>How long until I have it?</b><br>The digital edition arrives by email straight away. The printed book is made for you and mailed, and checkout shows the delivery estimate for your address before you pay. Faster shipping is an option there too.</p>
<p><b>Can I get it on Amazon?</b><br>No. It’s only sold on our site.</p>
<p><b>Is this a book about manipulating people?</b><br>No. It shows you how pressure works so it stops working on you. Every technique in it is one you could explain openly to the person affected.</p>
<p><a href="{{checkout_link}}"><b>Finish your order</b></a></p>
<p>Different question? Reply and ask.</p>
<p>Nate</p>`,
    text: `Hi,

When someone stops at checkout, it's usually one of these.

What if it isn't useful to me?
You have 30 days from delivery. Email me, send the book back, and you get a full refund.

How long until I have it?
The digital edition arrives by email straight away. The printed book is made for you and mailed, and checkout shows the delivery estimate for your address before you pay. Faster shipping is an option there too.

Can I get it on Amazon?
No. It's only sold on our site.

Is this a book about manipulating people?
No. It shows you how pressure works so it stops working on you. Every technique in it is one you could explain openly to the person affected.

Finish your order: {{checkout_link}}

Different question? Reply and ask.

Nate`,
  },
  {
    step: 3,
    afterHours: 72,
    subject: 'Last note about your order',
    preview: 'No deadline. Just the link, and a free chapter if you’d rather start there.',
    html: `<p>Hi,</p>
<p>This is the last reminder about your order. There’s no deadline and no special offer. It’ll be there whenever you’re ready.</p>
<p>If you’re still deciding, read a chapter first. It’s free, and it’s the one about why the right reply shows up hours too late:</p>
<p><a href="{{chapter_link}}">Read the free chapter</a></p>
<p>And if you’re ready now, your order is saved here:</p>
<p><a href="{{checkout_link}}"><b>Finish your order</b></a></p>
<p>Either way, thanks for considering it.</p>
<p>Nate</p>`,
    text: `Hi,

This is the last reminder about your order. There's no deadline and no special offer. It'll be there whenever you're ready.

If you're still deciding, read a chapter first. It's free, and it's the one about why the right reply shows up hours too late:
{{chapter_link}}

And if you're ready now, your order is saved here:
{{checkout_link}}

Either way, thanks for considering it.

Nate`,
  },
];
