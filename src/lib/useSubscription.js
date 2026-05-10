import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useSubscription() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.functions.invoke('getBillingPortal', {})
      .then((res) => setSubscription(res.data?.subscription || null))
      .catch(() => setSubscription(null))
      .finally(() => setLoading(false));
  }, []);

  // planName is "Pro" or "Plus" (from Stripe product name)
  const planName = subscription?.planName || 'Free';
  const isPro = planName === 'Pro';
  const isPlus = planName === 'Plus';
  const isPaid = isPro || isPlus;

  return { subscription, loading, planName, isPro, isPlus, isPaid };
}