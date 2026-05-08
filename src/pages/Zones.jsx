import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Loader2, Trash2, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import L from 'leaflet';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isAndroid, isIOS } from '@/lib/deviceDetect';

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
  const [formData, setFormData] = useState({
    name: '',
    latitude: null,
    longitude: null,
    radius_meters: 500
  });
  const [userLocation, setUserLocation] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadZones();
    // Get user location
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      (error) => console.error('Location error:', error)
    );
  }, []);

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

  const handleMapClick = (e) => {
    setFormData({
      ...formData,
      latitude: e.latlng.lat,
      longitude: e.latlng.lng
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
              <Label className="text-sm text-muted-foreground">Radius (meters)</Label>
              <Input
                type="number"
                value={formData.radius_meters}
                onChange={(e) => setFormData({ ...formData, radius_meters: parseInt(e.target.value) })}
                min="100"
                max="5000"
                className="mt-1 bg-muted/50"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Click on map to set location</Label>
              <div className="h-64 rounded-lg overflow-hidden border border-border">
                <MapContainer
                  center={mapCenter}
                  zoom={16}
                  style={{ height: '100%', width: '100%' }}
                  onClick={handleMapClick}
                >
                  <TileLayer
                    url={isAndroid() ? 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
                    subdomains={isAndroid() ? ['mt0', 'mt1', 'mt2', 'mt3'] : ['a', 'b', 'c']}
                    attribution={isAndroid() ? '&copy; Google Maps' : '&copy; OpenStreetMap contributors'}
                  />
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