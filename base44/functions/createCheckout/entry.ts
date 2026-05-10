import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const STRIPE_API_URL = 'https://api.stripe.com/v1';

const PRICE_IDS = {
  pro: 'price_1TUyGNCmyrIA0G168vckB106',
  plus: 'price_1TUyGNCmyrIA0G160Gt08D8q',
  'pro-yearly': 'price_1TVfQjCmyrIA0G16p0sQsruM',
  'plus-yearly': 'price_1TVfQjCmyrIA0G16GeOX2bun',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { priceId, isYearly } = body;

    const lookupKey = isYearly ? `${priceId}-yearly` : priceId;

    if (!lookupKey || !PRICE_IDS[lookupKey]) {
      return Response.json({ error: 'Invalid price ID' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || 'https://quickshield-call.base44.app';

    const sessionParams = new URLSearchParams();
    sessionParams.append('customer_email', user.email);
    sessionParams.append('line_items[0][price]', PRICE_IDS[lookupKey]);
    sessionParams.append('line_items[0][quantity]', '1');
    sessionParams.append('mode', 'subscription');
    sessionParams.append('success_url', `${origin}/pricing?session_id={CHECKOUT_SESSION_ID}`);
    sessionParams.append('cancel_url', `${origin}/pricing`);
    sessionParams.append('metadata[base44_app_id]', Deno.env.get('BASE44_APP_ID') || '');
    sessionParams.append('metadata[user_email]', user.email);

    // Only add trial for monthly plans
    if (!isYearly) {
      sessionParams.append('subscription_data[trial_period_days]', '7');
    }

    const response = await fetch(`${STRIPE_API_URL}/checkout/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: sessionParams.toString(),
    });

    const session = await response.json();

    if (!response.ok) {
      console.error('Stripe error:', JSON.stringify(session));
      return Response.json({ error: session?.error?.message || 'Failed to create checkout session' }, { status: 500 });
    }

    return Response.json({ sessionUrl: session.url });
  } catch (error) {
    console.error('Checkout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});