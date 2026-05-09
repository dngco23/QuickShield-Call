import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Loader2, Trash2, MapPin, Navigation, Radio, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Circle, Popup, useMapEvent } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { isAndroid, isIOS } from '@/lib/deviceDetect';
import LiveZoneMap from '@/components/LiveZoneMap';
import { usePushNotifications } from '@/lib/usePushNotifications';
import { useOfflineLocation } from '@/lib/useOfflineLocation';
import SyncStatus from '@/components/SyncStatus';
import { useSyncManager } from '@/lib/useSyncManager';

const EARTH_RADIUS = 6371000;
function calcDistance(lat1, lon1, lat2, lon2) {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function MapClickHandler({ onLocationSelect }) {
  useMapEvent('click', (e) => {
    onLocationSelect({
      latitude: e.latlng.lat,
      longitude: e.latlng.lng
    });
  });
  return null;
}

// Fix leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

export default function Zones() {
  const navigate = useNavigate();
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showLiveMap, setShowLiveMap] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    latitude: null,
    longitude: null,
    radius_meters: 500
  });
  const [userLocation, setUserLocation] = useState(null);
  const [saving, setSaving] = useState(false);
  const [zoneStatuses, setZoneStatuses] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const previousStatusRef = useRef({});
  const { sendNotification, permission } = usePushNotifications();
  const { location: offlineLocation } = useOfflineLocation(true);
  const { syncing, lastSyncTime } = useSyncManager();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    loadZones();
    // Use offline-first location tracking with automatic IndexedDB sync
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(newLocation);
      },
      (error) => console.error('Location error:', error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Cross-reference location against zones
  useEffect(() => {
    if (!userLocation || !zones.length) return;
    const newStatuses = {};
    zones.filter(z => z.enabled).forEach((zone) => {
      const dist = calcDistance(userLocation.lat, userLocation.lng, zone.latitude, zone.longitude);
      newStatuses[zone.id] = dist <= (zone.radius_meters || 500);
    });

    // Detect transitions and fire notifications
    zones.filter(z => z.enabled).forEach((zone) => {
      const wasInside = previousStatusRef.current[zone.id];
      const isInside = newStatuses[zone.id];
      if (wasInside === undefined) return; // skip first tick

      if (wasInside && !isInside) {
        // Exited zone
        const msg = { id: Date.now(), text: `Left zone: ${zone.name}`, type: 'exit' };
        setNotifications(prev => [msg, ...prev.slice(0, 4)]);
        if (permission === 'granted') sendNotification(`Left Safe Zone: ${zone.name}`, { body: `You have left ${zone.name}` });
        base44.entities.ZoneNotification.create({ zone_name: zone.name, event_type: 'exit', latitude: userLocation.lat, longitude: userLocation.lng, title: `Left Zone: ${zone.name}`, body: `You left ${zone.name}` }).catch(() => {});
      } else if (!wasInside && isInside) {
        // Entered zone
        const msg = { id: Date.now(), text: `Entered zone: ${zone.name}`, type: 'enter' };
        setNotifications(prev => [msg, ...prev.slice(0, 4)]);
        if (permission === 'granted') sendNotification(`Entered Safe Zone: ${zone.name}`, { body: `Welcome to ${zone.name}` });
        base44.entities.ZoneNotification.create({ zone_name: zone.name, event_type: 'enter', latitude: userLocation.lat, longitude: userLocation.lng, title: `Entered Zone: ${zone.name}`, body: `You entered ${zone.name}` }).catch(() => {});
      }
    });

    previousStatusRef.current = newStatuses;
    setZoneStatuses(newStatuses);
  }, [userLocation, zones]);

  const loadZones = async () => {
    try {
      const loadedZones = await base44.entities.Zone.list();
      setZones(loadedZones);
    } catch (error) {
      console.error('Failed to load zones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = ({ latitude, longitude }) => {
    setFormData({
      ...formData,
      latitude,
      longitude
    });
  };

  const handleSaveZone = async () => {
    if (!formData.name || formData.latitude === null || formData.longitude === null) {
      alert('Please fill in all fields and select a location on the map');
      return;
    }

    setSaving(true);
    try {
      await base44.entities.Zone.create({
        name: formData.name,
        latitude: formData.latitude,
        longitude: formData.longitude,
        radius_meters: formData.radius_meters,
        enabled: true
      });
      setFormData({ name: '', latitude: null, longitude: null, radius_meters: 500 });
      setShowForm(false);
      await loadZones();
    } catch (error) {
      console.error('Failed to save zone:', error);
      alert('Failed to save zone');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteZone = async (zoneId) => {
    if (!window.confirm('Delete this zone?')) return;
    try {
      await base44.entities.Zone.delete(zoneId);
      await loadZones();
    } catch (error) {
      console.error('Failed to delete zone:', error);
    }
  };

  const mapCenter = formData.latitude && formData.longitude
    ? [formData.latitude, formData.longitude]
    : userLocation
    ? [userLocation.lat, userLocation.lng]
    : [-33.8688, 151.2093]; // Sydney default

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <SyncStatus
        isOnline={isOnline}
        syncing={syncing}
        lastSyncTime={lastSyncTime}
        unsyncedCount={0}
      />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-5 pt-8 pb-6"
      >
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <h1 className="font-display text-2xl font-semibold">Safe Zones</h1>
        </div>
      </motion.div>

      <div className="px-5 space-y-4">

        {/* Live Map View */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border overflow-hidden"
        >
          <button
            onClick={() => setShowLiveMap(!showLiveMap)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Live Location Map</span>
              {userLocation && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <Radio className="w-3 h-3 animate-pulse" /> Live
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{showLiveMap ? '▲ Hide' : '▼ Show'}</span>
          </button>

          <AnimatePresence>
            {showLiveMap && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 320 }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <LiveZoneMap zones={zones.filter(z => z.enabled)} userLocation={userLocation} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Zone Status Cards */}
        {zones.filter(z => z.enabled).length > 0 && userLocation && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground/60 uppercase tracking-wider px-0.5">Zone Status</p>
            {zones.filter(z => z.enabled).map((zone) => {
              const inside = zoneStatuses[zone.id];
              return (
                <div key={zone.id} className={`flex items-center gap-3 rounded-xl p-3 border ${inside ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                  {inside ? <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${inside ? 'text-emerald-800' : 'text-red-800'}`}>{zone.name}</p>
                    <p className={`text-xs ${inside ? 'text-emerald-600' : 'text-red-500'}`}>
                      {inside ? 'You are inside this zone' : 'You are outside this zone'}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{zone.radius_meters || 500}m</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Recent Notifications */}
        <AnimatePresence>
          {notifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <p className="text-xs font-medium text-foreground/60 uppercase tracking-wider px-0.5">Recent Alerts</p>
              {notifications.map((n) => (
                <div key={n.id} className={`flex items-center gap-2 rounded-lg p-2.5 text-xs ${n.type === 'exit' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                  <span>{n.type === 'exit' ? '⚠️' : '✅'}</span>
                  <span>{n.text}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {!showForm ? (
          <Button
            onClick={() => setShowForm(true)}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Zone
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-4 space-y-4"
          >
            <div>
              <Label className="text-sm text-muted-foreground">Zone Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Home, School"
                className="mt-1 bg-muted/50"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm text-muted-foreground">Radius: {formData.radius_meters}m</Label>
              </div>
              <Slider
                value={[formData.radius_meters]}
                onValueChange={(value) => setFormData({ ...formData, radius_meters: value[0] })}
                min={100}
                max={5000}
                step={50}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>100m</span>
                <span>5000m</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Click on map to set location</Label>
              <div className="h-64 rounded-lg overflow-hidden border border-border bg-muted flex">
                <MapContainer
                  key={`${mapCenter[0]}-${mapCenter[1]}`}
                  center={mapCenter}
                  zoom={16}
                  style={{ height: '100%', width: '100%' }}
                  className="flex-1"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  <MapClickHandler onLocationSelect={handleMapClick} />
                  {formData.latitude && formData.longitude && (
                    <>
                      <Marker position={[formData.latitude, formData.longitude]}>
                        <Popup>{formData.name || 'Zone'}</Popup>
                      </Marker>
                      <Circle
                        center={[formData.latitude, formData.longitude]}
                        radius={formData.radius_meters}
                        pathOptions={{ color: 'blue', fillOpacity: 0.2 }}
                      />
                    </>
                  )}
                </MapContainer>
              </div>
              <p className="text-xs text-muted-foreground">
                {isAndroid() ? '📍 Tap the map to set zone location' : isIOS() ? '📍 Tap the map to set zone location' : 'Click on map to set location'}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSaveZone}
                disabled={saving}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Zone
              </Button>
              <Button
                onClick={() => {
                  setShowForm(false);
                  setFormData({ name: '', latitude: null, longitude: null, radius_meters: 500 });
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}

        {zones.length > 0 && (
          <div className="space-y-3">
            {zones.map((zone) => (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-lg border border-border p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-foreground">{zone.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Radius: {zone.radius_meters}m • {zone.enabled ? '✓ Active' : '○ Inactive'}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteZone(zone.id)}
                  className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {zones.length === 0 && !showForm && (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No zones created yet. Add one to get started.</p>
          </div>
        )}

        <div className="bg-accent/30 border border-accent rounded-lg p-4">
          <p className="text-xs text-accent-foreground/70 font-body leading-relaxed">
            💡 Safe zones alert you when you leave the area. Set zones for home, school, or other safe locations. Alerts trigger automatically when geolocation detects you've left.
          </p>
        </div>
      </div>
    </div>
  );
}