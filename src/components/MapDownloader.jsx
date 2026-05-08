import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Loader2, CheckCircle2, AlertTriangle, MapPin, Trash2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTrial } from '@/lib/trialContext';
import PaywallOverlay from '@/components/PaywallOverlay';

const TILE_CACHE_NAME = 'quickshield-map-tiles-v1';
const SAFE_ZONES_DB = 'quickshield-db';

export default function MapDownloader() {
  const { hasFeatureAccess } = useTrial();
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [cacheSize, setCacheSize] = useState(0);
  const [safeZones, setSafeZones] = useState([]);
  const [newZoneName, setNewZoneName] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);

  // Calculate offline cache size
  useEffect(() => {
    const calculateCacheSize = async () => {
      try {
        const cache = await caches.open(TILE_CACHE_NAME);
        const keys = await cache.keys();
        let size = 0;
        for (const request of keys) {
          const response = await cache.match(request);
          if (response) {
            size += response.headers.get('content-length') || 0;
          }
        }
        setCacheSize(Math.round(size / 1024 / 1024)); // Convert to MB
      } catch (_) {}
    };

    calculateCacheSize();
    
    // Load safe zones
    loadSafeZones();
  }, []);

  const loadSafeZones = async () => {
    try {
      const db = await openDB();
      const zones = await getAllSafeZones(db);
      setSafeZones(zones);
    } catch (_) {}
  };

  const openDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(SAFE_ZONES_DB, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('safeZones')) {
          db.createObjectStore('safeZones', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  };

  const getAllSafeZones = (db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('safeZones', 'readonly');
      const store = tx.objectStore('safeZones');
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  };

  const downloadMapArea = async () => {
    setDownloading(true);
    setDownloadProgress(0);

    try {
      // Get user's current location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      setUserLocation({ latitude, longitude });

      // Download tiles for the area (5km radius)
      const cache = await caches.open(TILE_CACHE_NAME);
      const zoomLevels = [11, 12, 13]; // Local area detail
      const tileUrls = [];

      // Generate tile URLs for offline access
      for (const zoom of zoomLevels) {
        const tileX = Math.floor((longitude + 180) / 360 * Math.pow(2, zoom));
        const tileY = Math.floor(
          (1 - Math.log(Math.tan(latitude * Math.PI / 180) + 1 / Math.cos(latitude * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)
        );

        // Download a 3x3 grid of tiles around the user
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const url = `https://tile.openstreetmap.org/${zoom}/${tileX + dx}/${tileY + dy}.png`;
            tileUrls.push(url);
          }
        }
      }

      // Download and cache tiles
      for (let i = 0; i < tileUrls.length; i++) {
        try {
          const response = await fetch(tileUrls[i]);
          if (response.ok) {
            await cache.put(tileUrls[i], response.clone());
          }
        } catch (_) {}
        setDownloadProgress(Math.round(((i + 1) / tileUrls.length) * 100));
      }

      // Recalculate cache size
      const keys = await cache.keys();
      let size = 0;
      for (const request of keys) {
        const resp = await cache.match(request);
        if (resp) {
          size += resp.headers.get('content-length') || 0;
        }
      }
      setCacheSize(Math.round(size / 1024 / 1024));
    } catch (error) {
      console.error('Failed to download maps:', error);
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  const addSafeZone = async () => {
    if (!newZoneName.trim() || !userLocation) return;

    try {
      const db = await openDB();
      const tx = db.transaction('safeZones', 'readwrite');
      const store = tx.objectStore('safeZones');
      const zone = {
        name: newZoneName,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        createdAt: new Date().toISOString(),
      };
      store.add(zone);

      await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });

      setNewZoneName('');
      await loadSafeZones();
    } catch (error) {
      console.error('Failed to add safe zone:', error);
    }
  };

  const deleteSafeZone = async (id) => {
    try {
      const db = await openDB();
      const tx = db.transaction('safeZones', 'readwrite');
      const store = tx.objectStore('safeZones');
      store.delete(id);

      await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });

      await loadSafeZones();
    } catch (error) {
      console.error('Failed to delete safe zone:', error);
    }
  };

  const handleDownloadClick = () => {
    if (!hasFeatureAccess('offline_maps')) {
      setShowPaywall(true);
      return;
    }
    downloadMapArea();
  };

  return (
    <>
      {showPaywall && (
        <PaywallOverlay
          featureName="Offline Maps"
          onClose={() => setShowPaywall(false)}
        />
      )}
      <div className="space-y-5">
        <div className="border-t border-border/50 pt-5">
        <p className="text-xs font-medium text-foreground/60 uppercase tracking-wider mb-4">Offline Maps</p>

        {/* Download status */}
        <AnimatePresence>
          {downloading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-foreground">Downloading map tiles...</p>
                <p className="text-xs text-muted-foreground">{downloadProgress}%</p>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <motion.div
                  className="bg-primary h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${downloadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cache info */}
        <div className="bg-muted/30 rounded-lg p-3 mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-foreground">Offline Maps Downloaded</p>
            <p className="text-xs text-muted-foreground mt-1">{cacheSize} MB cached locally</p>
          </div>
          {cacheSize > 0 && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
        </div>

        {/* Download button */}
        <div className="relative">
          <Button
            onClick={handleDownloadClick}
            disabled={downloading}
            className="w-full mb-4 bg-primary hover:bg-primary/90"
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : !hasFeatureAccess('offline_maps') ? (
              <Lock className="w-4 h-4 mr-2" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {downloading ? 'Downloading...' : !hasFeatureAccess('offline_maps') ? 'Offline Maps (Pro)' : 'Download Local Maps'}
          </Button>
        </div>

        {/* Safe zones */}
        <div className="border-t border-border/50 pt-4">
          <p className="text-xs font-medium text-foreground/60 uppercase tracking-wider mb-3">Safe Zones</p>
          <p className="text-xs text-muted-foreground mb-3">Mark safe locations for quick reference on offline maps</p>

          <div className="space-y-2 mb-3">
            <Label className="text-xs text-muted-foreground">Zone Name</Label>
            <div className="flex gap-2">
              <Input
                value={newZoneName}
                onChange={(e) => setNewZoneName(e.target.value)}
                placeholder="e.g. Police Station, Shelter"
                className="bg-muted/50 text-xs h-8"
                disabled={!userLocation}
              />
              <Button
                onClick={addSafeZone}
                size="sm"
                variant="outline"
                disabled={!newZoneName.trim() || !userLocation}
                className="h-8"
              >
                <MapPin className="w-3 h-3" />
              </Button>
            </div>
            {!userLocation && (
              <p className="text-xs text-muted-foreground">Download maps to mark safe zones at your location</p>
            )}
          </div>

          {/* Safe zones list */}
          <div className="space-y-2">
            {safeZones.length > 0 ? (
              safeZones.map((zone) => (
                <motion.div
                  key={zone.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between bg-accent/10 border border-accent/20 rounded-lg p-2"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-accent-foreground" />
                    <p className="text-xs font-medium text-foreground">{zone.name}</p>
                  </div>
                  <button
                    onClick={() => deleteSafeZone(zone.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </motion.div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic">No safe zones marked yet</p>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}