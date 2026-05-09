import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

const userIcon = L.divIcon({
  html: `<div style="
    width: 20px; height: 20px; border-radius: 50%;
    background: #3b82f6; border: 3px solid white;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.4), 0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function LiveZoneMap({ zones, userLocation, className = '' }) {
  const center = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [-33.8688, 151.2093];

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

  return (
    <MapContainer
      center={center}
      zoom={15}
      style={{ height: '100%', width: '100%' }}
      className={className}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {userLocation && (
        <>
          <RecenterMap center={[userLocation.lat, userLocation.lng]} />
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-sm">📍 You are here</p>
                <p className="text-xs text-gray-500 mt-1">
                  {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        </>
      )}

      {zones.map((zone) => {
        const inside = userLocation
          ? calcDistance(
              userLocation.lat, userLocation.lng,
              zone.latitude, zone.longitude
            ) <= (zone.radius_meters || 500)
          : null;

        const color = inside === null ? '#6366f1' : inside ? '#10b981' : '#ef4444';

        return (
          <React.Fragment key={zone.id}>
            <Circle
              center={[zone.latitude, zone.longitude]}
              radius={zone.radius_meters || 500}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.15,
                weight: 2,
              }}
            />
            <Marker position={[zone.latitude, zone.longitude]}>
              <Popup>
                <div className="text-center">
                  <p className="font-semibold text-sm">{zone.name}</p>
                  <p className="text-xs text-gray-500 mt-1">Radius: {zone.radius_meters || 500}m</p>
                  {inside !== null && (
                    <p className={`text-xs mt-1 font-medium ${inside ? 'text-green-600' : 'text-red-500'}`}>
                      {inside ? '✓ You are inside' : '✗ You are outside'}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        );
      })}
    </MapContainer>
  );
}