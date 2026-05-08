import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, message, to } = body;

    if (action === 'send') {
      if (!message || !to) {
        return Response.json({ error: 'Missing message or recipient' }, { status: 400 });
      }

      // Create message record in database
      const msg = await base44.entities.PanicMessage.create({
        from_user: user.email,
        to_user: to,
        content: message,
        direction: 'outgoing',
        timestamp: new Date().toISOString(),
      });

      // Send via SMS
      await base44.integrations.Core.SendEmail({
        to,
        subject: `Emergency message from ${user.full_name}`,
        body: message,
      });

      return Response.json({ success: true, message: msg });
    }

    if (action === 'list') {
      if (!to) {
        return Response.json({ error: 'Missing recipient' }, { status: 400 });
      }

      // Retrieve conversation history
      const messages = await base44.entities.PanicMessage.filter({
        from_user: user.email,
        to_user: to,
      }, '-timestamp', 50);

      return Response.json({ messages });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});