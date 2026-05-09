import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Fetch all users with emergency contacts and check-in settings
    const users = await base44.asServiceRole.entities.User.list();
    
    const alerts = [];
    const now = new Date();

    for (const user of users) {
      // Skip if no emergency contacts set
      if (!user.emergencyContact1Number && !user.emergencyContact2Number) {
        continue;
      }

      // Get check-in interval (default 24 hours if not set)
      const checkInIntervalHours = user.checkInIntervalHours || 24;
      const lastCheckInTime = user.lastCheckInTime ? new Date(user.lastCheckInTime) : null;
      
      // Calculate if check-in is overdue
      const hoursElapsed = lastCheckInTime 
        ? (now - lastCheckInTime) / (1000 * 60 * 60)
        : Infinity;

      if (hoursElapsed >= checkInIntervalHours) {
        // Check-in is overdue, send alert
        const message = `Check-in alert: ${user.full_name} hasn't logged a status in ${checkInIntervalHours} hours. Last check-in: ${lastCheckInTime ? lastCheckInTime.toLocaleString() : 'Never'}`;
        
        const promises = [];

        if (user.emergencyContact1Number) {
          promises.push(
            base44.asServiceRole.functions.invoke('sendSOSSms', {
              to: user.emergencyContact1Number,
              message: `⏰ ${message}`
            })
          );
        }

        if (user.emergencyContact2Number) {
          promises.push(
            base44.asServiceRole.functions.invoke('sendSOSSms', {
              to: user.emergencyContact2Number,
              message: `⏰ ${message}`
            })
          );
        }

        await Promise.all(promises);
        alerts.push({
          userId: user.id,
          userEmail: user.email,
          status: 'alert_sent',
          hoursOverdue: Math.round(hoursElapsed)
        });
      }
    }

    console.log(`Check-in status alerts processed: ${alerts.length} users alerted`);
    return Response.json({ success: true, alertsSent: alerts.length, details: alerts });
  } catch (error) {
    console.error('Check-in status alert error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});