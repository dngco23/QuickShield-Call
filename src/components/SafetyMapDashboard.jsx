import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Shield, Users, MapPin, CheckCircle2, AlertCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useSafety } from '@/lib/safetyContext.jsx';
import { format, formatDistanceToNow } from 'date-fns';

// Fix leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createColorIcon = (color) =>
  L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

const userIcon = L.divIcon({
  className: '',
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#7c3aed;border:3px solid white;box-shadow:0 1px 6px rgba(124,58,237,0.5)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

export default function SafetyMapDashboard() {
  const { panicModeActive, activeCheckIn } = useSafety();
  const [expanded, setExpanded] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [linkedChildren, setLinkedChildren] = useState([]);
  const [zoneNotifs, setZoneNotifs] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user location
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );

    const load = async () => {
      try {
        const [children, notifs, zoneList] = await Promise.all([
          base44.entities.LinkedAccount.list('-updated_date', 20),
          base44.entities.ZoneNotification.list('-created_date', 10),
          base44.entities.Zone.list('-created_date', 20),
        ]);
        setLinkedChildren(children);
        setZoneNotifs(notifs);
        setZones(zoneList);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const mapCenter = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [-33.8688, 151.2093]; // Sydney default

  // Overall status
  const overallStatus = panicModeActive
    ? { label: 'Panic Mode Active', color: 'text-red-500', bg: 'bg-red-50 border-red-200', dot: 'bg-red-500' }
    : activeCheckIn
    ? { label: 'Check-In Active', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500' }
    : { label: 'All Safe', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' };

  const childrenWithLocation = linkedChildren.filter(c => c.last_location?.latitude && c.last_location?.longitude);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-card border border-border/50 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Safety Map</p>
            <p className="text-xs text-muted-foreground">Your circle's live status</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Status badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${overallStatus.bg} ${overallStatus.color}`}>
            <motion.div
              animate={panicModeActive ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
              className={`w-1.5 h-1.5 rounded-full ${overallStatus.dot}`}
            />
            {overallStatus.label}
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Map */}
            <div className="h-56 relative">
              {loading ? (
                <div className="h-full flex items-center justify-center bg-muted/30">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : (
                <MapContainer
                  center={mapCenter}
                  zoom={14}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                  attributionControl={false}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {userLocation && <RecenterMap center={[userLocation.lat, userLocation.lng]} />}

                  {/* User location */}
                  {userLocation && (
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                      <Popup>📍 You are here</Popup>
                    </Marker>
                  )}

                  {/* Safe zones */}
                  {zones.filter(z => z.enabled && z.latitude && z.longitude).map(zone => (
                    <React.Fragment key={zone.id}>
                      <Circle
                        center={[zone.latitude, zone.longitude]}
                        radius={zone.radius_meters || 500}
                        pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.08, weight: 1.5 }}
                      />
                      <Marker position={[zone.latitude, zone.longitude]} icon={createColorIcon('#10b981')}>
                        <Popup>🟢 {zone.name}</Popup>
                      </Marker>
                    </React.Fragment>
                  ))}

                  {/* Linked children locations */}
                  {childrenWithLocation.map(child => (
                    <Marker
                      key={child.id}
                      position={[child.last_location.latitude, child.last_location.longitude]}
                      icon={createColorIcon('#f59e0b')}
                    >
                      <Popup>
                        <div className="text-sm font-medium">{child.child_name}</div>
                        <div className="text-xs text-gray-500">
                          {child.last_location.timestamp
                            ? formatDistanceToNow(new Date(child.last_location.timestamp), { addSuffix: true })
                            : 'Location tracked'}
                        </div>
                        {child.last_battery_level != null && (
                          <div className="text-xs text-gray-500">🔋 {child.last_battery_level}%</div>
                        )}
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}

              {/* Map Legend */}
              <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1.5 flex flex-col gap-1 z-[1000] shadow-sm">
                {[
                  { color: '#7c3aed', label: 'You' },
                  { color: '#f59e0b', label: 'Circle' },
                  { color: '#10b981', label: 'Safe zone' },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                    <span className="text-[10px] text-gray-600">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Circle Members */}
            <div className="p-4 space-y-3">
              {/* Your status */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm">🧑</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">You</p>
                  <p className="text-xs text-muted-foreground">
                    {activeCheckIn ? `Check-in active · ${Math.max(0, Math.ceil((activeCheckIn.expiresAt - Date.now()) / 60000))} min left` : 'No active check-in'}
                  </p>
                </div>
                <div className={`w-2 h-2 rounded-full ${panicModeActive ? 'bg-red-500' : activeCheckIn ? 'bg-amber-400' : 'bg-emerald-500'}`} />
              </div>

              {/* Children / circle members */}
              {linkedChildren.length > 0 ? (
                linkedChildren.map(child => {
                  const hasLoc = child.last_location?.latitude;
                  const batteryLow = child.last_battery_level != null && child.last_battery_level < 20;
                  return (
                    <div key={child.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/40">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-sm">👤</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-foreground truncate">{child.child_name}</p>
                          {batteryLow && <span className="text-[10px] text-red-500 font-medium">Low battery</span>}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {hasLoc
                            ? `Last seen ${formatDistanceToNow(new Date(child.last_location.timestamp || child.updated_date), { addSuffix: true })}`
                            : 'No location data'}
                        </p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${child.link_status === 'active' ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
                  <Users className="w-4 h-4" />
                  <span>No circle members linked yet — add them in Parental Controls.</span>
                </div>
              )}

              {/* Recent zone alerts */}
              {zoneNotifs.length > 0 && (
                <div className="pt-2 border-t border-border/40">
                  <p className="text-xs font-medium text-foreground/60 uppercase tracking-wider mb-2">Recent Zone Events</p>
                  <div className="space-y-2">
                    {zoneNotifs.slice(0, 3).map(n => (
                      <div key={n.id} className="flex items-start gap-2">
                        <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${n.event_type === 'enter' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                          {n.event_type === 'enter'
                            ? <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            : <AlertCircle className="w-2.5 h-2.5 text-amber-600" />}
                        </div>
                        <div>
                          <p className="text-xs text-foreground">{n.title}</p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {formatDistanceToNow(new Date(n.created_date), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}