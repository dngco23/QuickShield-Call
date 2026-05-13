import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const STRIPE_SECRET_KEY = Deno.env.get('Ssk_live_51TUy6pCmyrIA0G16n6UVKwGJGUdAqYlmxkNtLAv4MS0ccSGkUevQ7rTmON6MVePM8QLMmMi3jAb8dVavZbdpnjC8000GkabfcdTRIPE_SECRET_KEY');
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

    // Check if user already has an active subscription
    const searchRes = await fetch(`${STRIPE_API_URL}/customers?email=${encodeURIComponent(user.email)}&limit=1`, {
      headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` }
    });
    const searchData = await searchRes.json();
    if (searchData.data && searchData.data.length > 0) {
      const customerId = searchData.data[0].id;
      const subRes = await fetch(`${STRIPE_API_URL}/subscriptions?customer=${customerId}&status=active&limit=1`, {
        headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` }
      });
      const subData = await subRes.json();
      if (subData.data && subData.data.length > 0) {
        return Response.json({ error: 'already_subscribed' }, { status: 400 });
      }
    }

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