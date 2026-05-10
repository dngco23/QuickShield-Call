const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const STRIPE_API_URL = 'https://api.stripe.com/v1';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || 'https://quickshield-call.base44.app';

    // Find customer by email
    const searchRes = await fetch(`${STRIPE_API_URL}/customers?email=${encodeURIComponent(email)}&limit=1`, {
      headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` }
    });
    const searchData = await searchRes.json();

    if (!searchData.data || searchData.data.length === 0) {
      return Response.json({ subscription: null, portalUrl: null });
    }

    const customerId = searchData.data[0].id;

    // Get active subscriptions
    const subRes = await fetch(`${STRIPE_API_URL}/subscriptions?customer=${customerId}&status=active&limit=1`, {
      headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` }
    });
    const subData = await subRes.json();

    let subscription = null;
    if (subData.data && subData.data.length > 0) {
      const sub = subData.data[0];
      const priceItem = sub.items.data[0];
      const productId = priceItem?.price?.product;

      const prodRes = await fetch(`${STRIPE_API_URL}/products/${productId}`, {
        headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` }
      });
      const prodData = await prodRes.json();

      subscription = {
        planName: prodData.name,
        priceId: priceItem?.price?.id,
        amount: priceItem?.price?.unit_amount / 100,
        currency: priceItem?.price?.currency?.toUpperCase(),
        interval: priceItem?.price?.recurring?.interval,
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
      console.error('Portal error:', JSON.stringify(portalData));
      return Response.json({ subscription, portalUrl: null });
    }

    return Response.json({ subscription, portalUrl: portalData.url });
  } catch (error) {
    console.error('getBillingPortal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});