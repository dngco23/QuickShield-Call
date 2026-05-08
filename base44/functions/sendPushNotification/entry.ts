import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { zone_name, event_type, latitude, longitude } = await req.json();

    if (!zone_name || !event_type) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Determine notification title and body
    const title = event_type === 'exit' 
      ? `⚠️ Left Safe Zone: ${zone_name}`
      : `✓ Entered Safe Zone: ${zone_name}`;
    
    const body = latitude && longitude
      ? `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
      : `You are now ${event_type === 'exit' ? 'outside' : 'inside'} ${zone_name}`;

    // Store notification record
    await base44.entities.ZoneNotification.create({
      zone_name,
      event_type,
      latitude,
      longitude,
      title,
      body
    });

    return Response.json({ 
      success: true, 
      notification: { title, body } 
    });
  } catch (error) {
    console.error('Push notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});