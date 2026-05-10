import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import AdBanner from '@/components/AdBanner';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Basic safety features',
    features: [
      'SOS emergency button',
      'Fake call simulator',
      'Mood tracking',
      'Basic check-ins',
      'Zone monitoring (up to 2 zones)',
      'Emergency contact storage'
    ],
    cta: 'Your Current Plan',
    disabled: true
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 4.99,
    yearlyPrice: 35.88,
    monthlyPriceId: 'price_1TUyGNCmyrIA0G168vckB106',
    yearlyPriceId: 'price_1TVfQjCmyrIA0G16p0sQsruM',
    description: 'Advanced safety monitoring',
    features: [
      'Everything in Free, plus:',
      'Unlimited zones',
      'Voice wake-word detection',
      'Real-time location sharing',
      'Parent dashboard',
      'Detailed safety insights',
      'Priority support'
    ],
    monthlyCta: 'Start Pro Trial',
    yearlyCta: 'Get Pro Yearly',
    highlighted: false
  },
  {
    id: 'plus',
    name: 'Plus',
    monthlyPrice: 9.99,
    yearlyPrice: 71.88,
    monthlyPriceId: 'price_1TUyGNCmyrIA0G160Gt08D8q',
    yearlyPriceId: 'price_1TVfQjCmyrIA0G16GeOX2bun',
    description: 'Complete safety ecosystem',
    features: [
      'Everything in Pro, plus:',
      'Offline panic mode',
      'Recording with secure upload',
      'Stealth mode disguises',
      'Advanced family members',
      'Custom SOS messages',
      '24/7 emergency support'
    ],
    monthlyCta: 'Start Plus Trial',
    yearlyCta: 'Get Plus Yearly',
    highlighted: true
  }
];

export default function Pricing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);
  const [billing, setBilling] = useState('monthly');

  const handleSubscribe = async (plan) => {
    if (plan.disabled) return;

    const priceId = billing === 'yearly' ? plan.yearlyPriceId : plan.monthlyPriceId;
    const isYearly = billing === 'yearly';

    setLoading(plan.id);
    try {
      const response = await base44.functions.invoke('createCheckout', { priceId: plan.id, isYearly });

      if (response.data?.sessionUrl) {
        window.open(response.data.sessionUrl, '_blank');
      } else {
        alert(response.data?.error || 'Failed to start checkout. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-5 pt-8 pb-6 border-b border-border/50"
      >
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-2xl font-semibold">Upgrade Plan</h1>
      </motion.div>

      <div className="px-5 py-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="font-display text-3xl font-semibold text-foreground mb-2">
            Choose Your Safety Plan
          </h2>
          <p className="text-muted-foreground">
            {billing === 'monthly' ? 'Monthly plans include a 7-day free trial.' : 'Yearly plans are billed upfront — best value.'}
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex items-center justify-center mb-8"
        >
          <div className="inline-flex items-center bg-muted rounded-xl p-1 gap-1">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                billing === 'monthly'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                billing === 'yearly'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yearly
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">Save 40%</span>
            </button>
          </div>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {PLANS.map((plan, idx) => {
            const price = billing === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
            const cta = plan.disabled ? plan.cta : (billing === 'yearly' ? plan.yearlyCta : plan.monthlyCta);
            return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`rounded-2xl border transition-all ${
                plan.highlighted
                  ? 'border-primary bg-gradient-to-b from-primary/5 to-primary/2 ring-2 ring-primary/30'
                  : 'border-border bg-card'
              } p-6 flex flex-col`}
            >
              {plan.highlighted && (
                <div className="bg-primary/20 border border-primary/30 text-primary text-xs font-medium px-3 py-1 rounded-full w-fit mb-4">
                  Most Popular
                </div>
              )}

              <h3 className="font-display text-2xl font-semibold text-foreground mb-2">
                {plan.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

              <div className="mb-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">A${price}</span>
                  {price > 0 && <span className="text-muted-foreground">/{billing === 'yearly' ? 'year' : 'month'}</span>}
                </div>
                {billing === 'yearly' && price > 0 && (
                  <p className="text-xs text-green-600 font-medium mt-1">
                    A${(price / 12).toFixed(2)}/month — billed yearly
                  </p>
                )}
              </div>

              {billing === 'yearly' && price > 0 && (
                <p className="text-xs text-muted-foreground mb-4">Pay now, no trial period</p>
              )}
              {billing === 'monthly' && price > 0 && (
                <p className="text-xs text-muted-foreground mb-4">7-day free trial included</p>
              )}
              {price === 0 && <div className="mb-4" />}

              <Button
                onClick={() => handleSubscribe(plan)}
                disabled={plan.disabled || loading === plan.id}
                className={`w-full mb-6 ${
                  plan.highlighted
                    ? 'bg-primary hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {loading === plan.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  cta
                )}
              </Button>

              <div className="space-y-3 flex-1">
                {plan.features.map((feature, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 text-sm ${
                      feature.startsWith('Everything') || feature.startsWith('All ')
                        ? 'font-medium text-muted-foreground'
                        : 'text-foreground'
                    }`}
                  >
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            );
          })}
        </div>

        <AdBanner className="rounded-2xl mb-4" />

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-accent/30 border border-accent rounded-lg p-4 text-center"
        >
          <p className="text-xs text-accent-foreground/70 font-body">
            {billing === 'monthly'
              ? '💳 Monthly plans start with a 7-day free trial. Cancel anytime, no questions asked.'
              : '💳 Yearly plans are billed upfront with no trial period. Cancel anytime for remaining months.'}
          </p>
        </motion.div>
      </div>
    </div>
  );
}