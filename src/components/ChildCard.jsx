import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Battery, Trash2, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ChildCard({ child, onUnlink }) {
  const [zoneHistory, setZoneHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (child.link_status === 'active') {
      loadZoneHistory();
    }
  }, [child.id, child.link_status]);

  const loadZoneHistory = async () => {
    setLoadingHistory(true);
    try {
      const history = await base44.entities.ZoneNotification.filter({
        created_by: child.child_email
      }, '-created_date', 5); // Last 5 zone events
      setZoneHistory(history);
    } catch (error) {
      console.error('Failed to load zone history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getBatteryColor = (level) => {
    if (level < 20) return 'text-destructive';
    if (level < 50) return 'text-accent';
    return 'text-green-600';
  };

  const getPendingBadge = child.link_status === 'pending' ? (
    <div className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
      <Clock className="w-3 h-3" />
      Pending
    </div>
  ) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border p-4 space-y-4"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-foreground">{child.child_name}</h3>
          <p className="text-xs text-muted-foreground mt-1">{child.child_email}</p>
          {getPendingBadge}
        </div>
        <button
          onClick={onUnlink}
          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {child.link_status === 'active' && (
        <>
          {/* Location & Battery Row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Location */}
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">Location</span>
              </div>
              {child.last_location ? (
                <div className="text-xs text-foreground">
                  <p className="font-mono">
                    {child.last_location.latitude?.toFixed(4)}, {child.last_location.longitude?.toFixed(4)}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {formatTime(child.last_location.timestamp)}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No location data</p>
              )}
            </div>

            {/* Battery */}
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Battery className={`w-4 h-4 ${getBatteryColor(child.last_battery_level || 0)}`} />
                <span className="text-xs font-medium text-muted-foreground">Battery</span>
              </div>
              <p className={`text-lg font-bold ${getBatteryColor(child.last_battery_level || 0)}`}>
                {child.last_battery_level ?? 'N/A'}%
              </p>
              {child.last_battery_level && child.last_battery_level < 20 && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Low battery
                </p>
              )}
            </div>
          </div>

          {/* Zone History */}
          {zoneHistory.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Zone Activity</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {zoneHistory.map((event) => (
                  <div key={event.id} className="flex items-start gap-2 p-2 bg-muted/20 rounded-lg">
                    <div className="mt-0.5">
                      {event.event_type === 'enter' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">
                        {event.event_type === 'enter' ? 'Entered' : 'Left'} <span className="font-semibold">{event.zone_name}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(event.created_date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {child.link_status === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3">
          <p className="text-xs text-yellow-700">
            Awaiting acceptance from {child.child_name}'s device
          </p>
        </div>
      )}
    </motion.div>
  );
}