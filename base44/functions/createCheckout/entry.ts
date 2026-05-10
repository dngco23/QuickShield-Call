const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const STRIPE_API_URL = 'https://api.stripe.com/v1';

const PRICE_IDS = {
  pro: 'price_1TUyGNCmyrIA0G168vckB106',
  plus: 'price_1TUyGNCmyrIA0G160Gt08D8q',
};

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { priceId, email } = body;

    if (!priceId || !PRICE_IDS[priceId]) {
      return Response.json({ error: 'Invalid price ID' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || 'https://quickshield-call.base44.app';

    const sessionParams = new URLSearchParams();
    if (email) sessionParams.append('customer_email', email);
    sessionParams.append('line_items[0][price]', PRICE_IDS[priceId]);
    sessionParams.append('line_items[0][quantity]', '1');
    sessionParams.append('mode', 'subscription');
    sessionParams.append('success_url', `${origin}/pricing?session_id={CHECKOUT_SESSION_ID}`);
    sessionParams.append('cancel_url', `${origin}/pricing`);
    sessionParams.append('metadata[base44_app_id]', Deno.env.get('BASE44_APP_ID') || '');
    if (email) sessionParams.append('metadata[user_email]', email);

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