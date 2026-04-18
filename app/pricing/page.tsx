'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { PricingPlans } from '@/components/app/PricingPlans';
import { useSubscription } from '@/lib/subscription';
import Link from 'next/link';
import Footer from '@/app/(marketing)/homepage-components/Footer';

export default function PricingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { subscription, loading: subLoading, isActive } = useSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleSelect = async (plan: 'weekly' | 'monthly' | 'yearly') => {
    router.push(`/checkout?plan=${plan}`);
  };

  const handleManage = async () => {
    if (!subscription?.customerId) return;
    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ customerId: subscription.customerId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#F4ECD8]">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-4">
          <Link href="/" className="text-sm text-[#D4A017] hover:underline mb-4 inline-block">&larr; Back to Home</Link>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">Choose Your Plan</h1>
          <p className="text-lg text-[#5C4B32] max-w-2xl mx-auto">
            Start training today. Cancel anytime. 30-day money-back guarantee.
          </p>
        </div>

        {isActive && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-green-50 border border-green-300 rounded-lg text-center">
            <p className="text-green-800 font-bold">You have an active {subscription.plan} subscription</p>
            <button onClick={handleManage} className="mt-2 text-sm text-[#D4A017] hover:underline">
              Manage Subscription
            </button>
          </div>
        )}

        <PricingPlans
          onSelect={handleSelect}
          loading={checkoutLoading || authLoading || subLoading}
          currentPlan={isActive ? subscription?.plan : undefined}
        />
      </div>

      <Footer />
    </div>
  );
}
