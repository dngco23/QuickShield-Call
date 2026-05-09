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
    price: 0,
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
    price: 4.99,
    priceId: 'price_1TUyGNCmyrIA0G168vckB106',
    productId: 'prod_UTw8VgUlSWk5yO',
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
    cta: 'Start Pro Trial',
    highlighted: false
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 9.99,
    priceId: 'price_1TUyGNCmyrIA0G160Gt08D8q',
    productId: 'prod_UTw8iPGl2IjJd8',
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
    cta: 'Start Plus Trial',
    highlighted: true
  }
];

export default function Pricing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);

  const handleSubscribe = async (plan) => {
    if (plan.disabled) return;

    setLoading(plan.id);
    try {
      // Check if running in iframe
      if (window.self !== window.top) {
        alert('Checkout only works in the published app. Please visit the app directly to subscribe.');
        setLoading(null);
        return;
      }

      const response = await base44.functions.invoke('createCheckout', {
        priceId: plan.priceId,
        productId: plan.productId
      });

      if (response.data.sessionUrl) {
        window.location.href = response.data.sessionUrl;
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
          className="text-center mb-10"
        >
          <h2 className="font-display text-3xl font-semibold text-foreground mb-2">
            Choose Your Safety Plan
          </h2>
          <p className="text-muted-foreground">
            All plans include a 7-day free trial. No credit card required.
          </p>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {PLANS.map((plan, idx) => (
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

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">A${plan.price}</span>
                  {plan.price > 0 && <span className="text-muted-foreground">/month</span>}
                </div>
              </div>

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
                  plan.cta
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
          ))}
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
            💳 All subscriptions start with a 7-day free trial. Cancel anytime, no questions asked.
          </p>
        </motion.div>
      </div>
    </div>
  );
}