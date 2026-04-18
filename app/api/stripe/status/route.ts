import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserFromRequest } from '@/lib/auth-api';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);

    if (!userId) {
      return NextResponse.json({ active: false });
    }

    // First try by user_id
    let { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    // If not found, try by email (for users who paid before creating account)
    if (!data) {
      // Get the user's email from the users table
      const { data: userData } = await supabase
        .from('users')
        .select('email')
        .eq('firebase_uid', userId)
        .single();

      if (userData?.email) {
        const { data: emailMatch } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('email', userData.email)
          .single();

        if (emailMatch) {
          // Link this subscription to their firebase uid
          await supabase
            .from('subscriptions')
            .update({ user_id: userId })
            .eq('id', emailMatch.id);
          data = emailMatch;
        }
      }
    }

    if (!data) {
      return NextResponse.json({ active: false });
    }

    const isActive = data.status === 'active' || data.status === 'trialing';

    return NextResponse.json({
      active: isActive,
      plan: data.plan,
      status: data.status,
      currentPeriodEnd: data.current_period_end,
      customerId: data.stripe_customer_id,
    });
  } catch (err) {
    console.error('[STRIPE STATUS]', err);
    return NextResponse.json({ active: false });
  }
}
