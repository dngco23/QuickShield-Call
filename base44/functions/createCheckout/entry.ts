import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const STRIPE_API_URL = 'https://api.stripe.com/v1';

const PRICE_IDS = {
  monthly: 'price_1TUwfc7bPxMfjxCSia1tdGvR',
  yearly: 'price_1TUwfc7bPxMfjxCSYByFUrdz',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is in an iframe (published app check)
    const origin = req.headers.get('origin');
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      // Allow local dev, block preview
      if (req.headers.get('referer')?.includes('preview')) {
        return Response.json(
          { error: 'Checkout works only from a published app' },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const { priceId = 'monthly' } = body;

    const sessionParams = {
      customer_email: user.email,
      line_items: [
        {
          price: PRICE_IDS[priceId] || PRICE_IDS.monthly,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/settings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/settings`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        user_email: user.email,
      },
    };

    const searchParams = new URLSearchParams();
    Object.entries(sessionParams).forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue], idx) => {
          searchParams.append(`${key}[${idx}][${subKey}]`, subValue);
        });
      } else {
        searchParams.append(key, value);
      }
    });

    const response = await fetch(`${STRIPE_API_URL}/checkout/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: searchParams.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Stripe error:', error);
      return Response.json({ error: 'Failed to create checkout session' }, { status: 500 });
    }

    const session = await response.json();
    return Response.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});