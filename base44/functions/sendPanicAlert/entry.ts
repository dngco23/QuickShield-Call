import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { to, contactName, userName, situationSummary, locationText } = await req.json();

    if (!to) {
      return Response.json({ error: 'Missing recipient phone number' }, { status: 400 });
    }

    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
    const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.error('Missing Twilio environment variables');
      return Response.json({ error: 'SMS service not configured' }, { status: 500 });
    }

    const body = [
      `🚨 EMERGENCY ALERT from QuickShield Call`,
      ``,
      `${userName || 'A user'} may need immediate help.`,
      situationSummary ? `Situation: ${situationSummary}` : '',
      locationText ? `Location: ${locationText}` : '',
      ``,
      `Please call them immediately or contact emergency services.`,
    ].filter(Boolean).join('\n');

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    const formData = new URLSearchParams();
    formData.append('To', to);
    formData.append('From', TWILIO_PHONE_NUMBER);
    formData.append('Body', body);

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Twilio error:', result);
      return Response.json({ error: result.message || 'Failed to send SMS' }, { status: 500 });
    }

    console.log(`Panic alert sent to ${contactName || to} (SID: ${result.sid})`);

    // Log the outgoing panic message
    await base44.entities.PanicMessage.create({
      from_user: user.email,
      to_user: to,
      content: body,
      direction: 'outgoing',
      timestamp: new Date().toISOString(),
    });

    return Response.json({ success: true, sid: result.sid });
  } catch (error) {
    console.error('sendPanicAlert error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});