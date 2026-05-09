import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { latitude, longitude, timestamp, accuracy } = await req.json();

    if (latitude === undefined || longitude === undefined) {
      return Response.json({ error: 'Missing coordinates' }, { status: 400 });
    }

    // Store location data - you can create a Location entity or track via another method
    // For now, we'll just log it as received
    console.log(`Location data received from ${user.email}: ${latitude}, ${longitude} at ${timestamp}`);

    return Response.json({
      success: true,
      message: 'Location data stored',
      stored_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error storing location data:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});