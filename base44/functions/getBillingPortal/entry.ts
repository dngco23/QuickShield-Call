import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const STRIPE_API_URL = 'https://api.stripe.com/v1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const origin = req.headers.get('origin') || 'https://app.base44.com';

    // Find customer by email
    const searchRes = await fetch(`${STRIPE_API_URL}/customers?email=${encodeURIComponent(user.email)}&limit=1`, {
      headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` }
    });
    const searchData = await searchRes.json();

    if (!searchData.data || searchData.data.length === 0) {
      return Response.json({ error: 'No Stripe customer found for this account' }, { status: 404 });
    }

    const customerId = searchData.data[0].id;

    // Get active subscriptions for this customer
    const subRes = await fetch(`${STRIPE_API_URL}/subscriptions?customer=${customerId}&status=active&limit=1`, {
      headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` }
    });
    const subData = await subRes.json();

    let subscription = null;
    if (subData.data && subData.data.length > 0) {
      const sub = subData.data[0];
      const priceId = sub.items.data[0]?.price?.id;
      const amount = sub.items.data[0]?.price?.unit_amount;
      const currency = sub.items.data[0]?.price?.currency;
      const interval = sub.items.data[0]?.price?.recurring?.interval;
      const productId = sub.items.data[0]?.price?.product;

      // Get product name
      const prodRes = await fetch(`${STRIPE_API_URL}/products/${productId}`, {
        headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` }
      });
      const prodData = await prodRes.json();

      subscription = {
        planName: prodData.name,
        priceId,
        amount: amount / 100,
        currency: currency?.toUpperCase(),
        interval,
        currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        status: sub.status,
      };
    }

    // Create billing portal session
    const portalParams = new URLSearchParams({
      customer: customerId,
      return_url: `${origin}/settings`,
    });

    const portalRes = await fetch(`${STRIPE_API_URL}/billing_portal/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: portalParams.toString(),
    });

    const portalData = await portalRes.json();

    if (!portalRes.ok) {
      console.error('Portal error:', portalData);
      return Response.json({ subscription, portalUrl: null });
    }

    return Response.json({ subscription, portalUrl: portalData.url });
  } catch (error) {
    console.error('getBillingPortal error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});