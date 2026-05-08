import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, daysOld } = body;

    if (action === 'purge') {
      if (!daysOld || daysOld < 1) {
        return Response.json({ error: 'Invalid days parameter' }, { status: 400 });
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      try {
        // Delete old recordings
        const recordings = await base44.entities.Recording.filter(
          { created_by: user.email },
          '-created_date',
          1000
        );

        for (const recording of recordings) {
          const recordingDate = new Date(recording.created_date);
          if (recordingDate < cutoffDate) {
            await base44.entities.Recording.delete(recording.id);
          }
        }

        // Delete old messages
        const messages = await base44.entities.PanicMessage.filter(
          { from_user: user.email },
          '-timestamp',
          1000
        );

        for (const message of messages) {
          const msgDate = new Date(message.timestamp);
          if (msgDate < cutoffDate) {
            await base44.entities.PanicMessage.delete(message.id);
          }
        }

        return Response.json({ success: true, message: 'Privacy purge completed' });
      } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});