import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { latitude, longitude, batteryLevel } = body;

    if (!latitude || !longitude) {
      return Response.json({ error: 'Missing location data' }, { status: 400 });
    }

    const locationUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
    const message = `⚠️ CRITICAL LOW BATTERY from ${user.full_name || 'unknown user'}\n\nBattery: ${batteryLevel}%\nLast Known Location: ${locationUrl}\n\nDevice may lose connectivity.`;

    const promises = [];
    
    if (user.emergencyContact1Number) {
      promises.push(base44.functions.invoke('sendSOSSms', {
        to: user.emergencyContact1Number,
        message,
      }));
    }
    
    if (user.emergencyContact2Number) {
      promises.push(base44.functions.invoke('sendSOSSms', {
        to: user.emergencyContact2Number,
        message,
      }));
    }

    if (promises.length === 0) {
      return Response.json({ error: 'No emergency contacts configured' }, { status: 400 });
    }

    await Promise.all(promises);

    return Response.json({ success: true, message: 'Low battery alerts sent' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});