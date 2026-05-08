import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Satellite, Map as MapIcon } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

export default function LocationMap({ latitude, longitude, childName }) {
  const [isSatellite, setIsSatellite] = useState(false);

  if (!latitude || !longitude) {
    return (
      <div className="w-full h-64 bg-muted rounded-lg border border-border flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Location unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Live Location
        </p>
        <motion.button
          onClick={() => setIsSatellite(!isSatellite)}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-muted hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground"
        >
          {isSatellite ? (
            <>
              <MapIcon className="w-3 h-3" />
              Standard
            </>
          ) : (
            <>
              <Satellite className="w-3 h-3" />
              Satellite
            </>
          )}
        </motion.button>
      </div>

      <div className="rounded-lg overflow-hidden border border-border bg-muted h-64">
        <MapContainer
          center={[latitude, longitude]}
          zoom={16}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url={
              isSatellite
                ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            }
            attribution={
              isSatellite
                ? '&copy; Esri'
                : '&copy; OpenStreetMap contributors'
            }
          />
          <Marker position={[latitude, longitude]}>
            <Popup>{childName}'s current location</Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
        <MapPin className="w-3 h-3" />
        <span>{latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
      </div>
    </motion.div>
  );
}