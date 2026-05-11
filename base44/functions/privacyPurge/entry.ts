import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let body = {};
    try { body = await req.json(); } catch (_) {}

    const { daysOld = 30 } = body;

    // Scheduled automations have no user session — use service role for all purges.
    // If called from the frontend with a logged-in user, scope to that user only.
    const user = await base44.auth.me().catch(() => null);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - Math.max(1, daysOld));

    const db = user ? base44.entities : base44.asServiceRole.entities;

    // Fetch and delete old recordings
    const recordingFilter = user ? { created_by: user.email } : {};
    const recordings = await db.Recording.filter(recordingFilter, '-created_date', 1000);
    let deletedRecordings = 0;
    for (const rec of recordings) {
      if (new Date(rec.created_date) < cutoffDate) {
        await db.Recording.delete(rec.id);
        deletedRecordings++;
      }
    }

    // Fetch and delete old panic messages
    const messageFilter = user ? { from_user: user.email } : {};
    const messages = await db.PanicMessage.filter(messageFilter, '-timestamp', 1000);
    let deletedMessages = 0;
    for (const msg of messages) {
      if (new Date(msg.timestamp) < cutoffDate) {
        await db.PanicMessage.delete(msg.id);
        deletedMessages++;
      }
    }

    console.log(`Privacy purge complete: ${deletedRecordings} recordings, ${deletedMessages} messages deleted (cutoff: ${cutoffDate.toISOString()})`);
    return Response.json({ success: true, deletedRecordings, deletedMessages });
  } catch (error) {
    console.error('Privacy purge error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});