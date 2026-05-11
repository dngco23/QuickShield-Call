import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Loader2, CheckCircle2, MapPin, Trash2, Lock, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTrial } from '@/lib/trialContext';
import PaywallOverlay from '@/components/PaywallOverlay';
import { base44 } from '@/api/base44Client';

const TILE_CACHE_NAME = 'quickshield-map-tiles-v2';
const ZOOM_LEVELS = [11, 12, 13, 14, 15]; // street-level detail up to ~500m
const GRID_RADIUS = 2; // 5×5 tile grid per zoom

// Convert lat/lng to tile x/y at a given zoom
function latLngToTile(lat, lng, zoom) {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return { x, y };
}

// Generate all tile URLs for a given lat/lng region
function getTileUrls(lat, lng) {
  const urls = new Set();
  for (const zoom of ZOOM_LEVELS) {
    const { x, y } = latLngToTile(lat, lng, zoom);
    for (let dx = -GRID_RADIUS; dx <= GRID_RADIUS; dx++) {
      for (let dy = -GRID_RADIUS; dy <= GRID_RADIUS; dy++) {
        // Distribute across OSM tile servers (a, b, c) to avoid rate-limiting
        const server = ['a', 'b', 'c'][(Math.abs(dx + dy)) % 3];
        urls.add(`https://${server}.tile.openstreetmap.org/${zoom}/${x + dx}/${y + dy}.png`);
      }
    }
  }
  return [...urls];
}

// Calculate total cached tile count
async function getCachedTileCount() {
  try {
    const cache = await caches.open(TILE_CACHE_NAME);
    const keys = await cache.keys();
    return keys.length;
  } catch {
    return 0;
  }
}

// Check if a zone already has tiles cached
async function isZoneCached(lat, lng) {
  try {
    const cache = await caches.open(TILE_CACHE_NAME);
    // Just sample-check one tile per zone at zoom 14
    const { x, y } = latLngToTile(lat, lng, 14);
    const testUrl = `https://a.tile.openstreetmap.org/14/${x}/${y}.png`;
    const match = await cache.match(testUrl);
    return !!match;
  } catch {
    return false;
  }
}

export default function MapDownloader() {
  const { hasFeatureAccess } = useTrial();
  const [zones, setZones] = useState([]);
  const [zoneStatus, setZoneStatus] = useState({}); // { zoneId: 'cached' | 'downloading' | null }
  const [currentProgress, setCurrentProgress] = useState({ zoneId: null, pct: 0 });
  const [totalTiles, setTotalTiles] = useState(0);
  const [loadingZones, setLoadingZones] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const [clearing, setClearing] = useState(false);

  const loadZones = useCallback(async () => {
    setLoadingZones(true);
    try {
      const fetched = await base44.entities.Zone.filter({ enabled: true });
      setZones(fetched);

      // Check cache status per zone
      const status = {};
      for (const z of fetched) {
        status[z.id] = (await isZoneCached(z.latitude, z.longitude)) ? 'cached' : null;
      }
      setZoneStatus(status);
    } catch (e) {
      console.error('Failed to load zones:', e);
    } finally {
      setLoadingZones(false);
    }
  }, []);

  useEffect(() => {
    loadZones();
    getCachedTileCount().then(setTotalTiles);
  }, [loadZones]);

  const downloadZone = async (zone) => {
    if (!hasFeatureAccess('offline_maps')) {
      setShowPaywall(true);
      return;
    }

    setZoneStatus((s) => ({ ...s, [zone.id]: 'downloading' }));
    setCurrentProgress({ zoneId: zone.id, pct: 0 });

    try {
      const urls = getTileUrls(zone.latitude, zone.longitude);
      const cache = await caches.open(TILE_CACHE_NAME);

      for (let i = 0; i < urls.length; i++) {
        try {
          // Skip if already cached
          const existing = await cache.match(urls[i]);
          if (!existing) {
            const res = await fetch(urls[i], { mode: 'no-cors' });
            if (res.type === 'opaque' || res.ok) {
              await cache.put(urls[i], res);
            }
          }
        } catch {
          // Individual tile failures are non-fatal
        }
        setCurrentProgress({ zoneId: zone.id, pct: Math.round(((i + 1) / urls.length) * 100) });
      }

      setZoneStatus((s) => ({ ...s, [zone.id]: 'cached' }));
      const count = await getCachedTileCount();
      setTotalTiles(count);
    } catch (err) {
      console.error('Map download failed:', err);
      setZoneStatus((s) => ({ ...s, [zone.id]: null }));
    } finally {
      setCurrentProgress({ zoneId: null, pct: 0 });
    }
  };

  const downloadAllZones = async () => {
    for (const zone of zones) {
      if (zoneStatus[zone.id] !== 'cached') {
        await downloadZone(zone);
      }
    }
  };

  const clearCache = async () => {
    setClearing(true);
    try {
      await caches.delete(TILE_CACHE_NAME);
      setTotalTiles(0);
      const cleared = {};
      zones.forEach((z) => (cleared[z.id] = null));
      setZoneStatus(cleared);
    } catch (e) {
      console.error('Clear cache failed:', e);
    } finally {
      setClearing(false);
    }
  };

  const cachedCount = Object.values(zoneStatus).filter((v) => v === 'cached').length;
  const hasAccess = hasFeatureAccess('offline_maps');

  return (
    <>
      {showPaywall && (
        <PaywallOverlay featureName="Offline Maps" onClose={() => setShowPaywall(false)} />
      )}

      <div className="border-t border-border/50 pt-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-foreground/60 uppercase tracking-wider">Offline Maps</p>
          <button
            onClick={loadZones}
            aria-label="Refresh zone list"
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Summary */}
        <div className="bg-muted/30 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs font-medium text-foreground">
                {cachedCount} / {zones.length} zone{zones.length !== 1 ? 's' : ''} cached
              </p>
              <p className="text-xs text-muted-foreground">{totalTiles} tiles stored locally</p>
            </div>
          </div>
          {cachedCount > 0 && (
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
          )}
        </div>

        {/* Per-zone list */}
        {loadingZones ? (
          <div className="flex items-center gap-2 py-2">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Loading zones...</p>
          </div>
        ) : zones.length === 0 ? (
          <div className="bg-accent/20 border border-accent/30 rounded-xl p-4 text-center">
            <MapPin className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              No zones set up yet. Add zones in the Zones tab to download their maps.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {zones.map((zone) => {
              const status = zoneStatus[zone.id];
              const isDownloading = status === 'downloading';
              const isCached = status === 'cached';
              const pct = currentProgress.zoneId === zone.id ? currentProgress.pct : 0;

              return (
                <motion.div
                  key={zone.id}
                  layout
                  className="bg-card border border-border/50 rounded-xl p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{zone.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {zone.latitude?.toFixed(4)}, {zone.longitude?.toFixed(4)}
                          {zone.radius_meters && ` · r=${zone.radius_meters}m`}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => downloadZone(zone)}
                      disabled={isDownloading}
                      aria-label={
                        isCached
                          ? `Re-download maps for ${zone.name}`
                          : `Download maps for ${zone.name}`
                      }
                      className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                        ${isCached
                          ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                          : hasAccess
                          ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
                          : 'bg-muted text-muted-foreground border border-border'
                        }`}
                    >
                      {isDownloading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : isCached ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : hasAccess ? (
                        <Download className="w-3 h-3" />
                      ) : (
                        <Lock className="w-3 h-3" />
                      )}
                      {isDownloading ? `${pct}%` : isCached ? 'Cached' : 'Download'}
                    </button>
                  </div>

                  {/* Progress bar */}
                  <AnimatePresence>
                    {isDownloading && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2"
                      >
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <motion.div
                            className="bg-primary h-1.5 rounded-full"
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.2 }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Downloading street-level tiles ({ZOOM_LEVELS.length} zoom levels)…
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Download all + clear */}
        <div className="flex gap-2">
          <Button
            onClick={
              hasAccess
                ? downloadAllZones
                : () => setShowPaywall(true)
            }
            disabled={zones.length === 0 || zones.every((z) => zoneStatus[z.id] === 'cached')}
            className="flex-1 bg-primary hover:bg-primary/90 text-xs"
            size="sm"
          >
            {hasAccess ? (
              <Download className="w-3 h-3 mr-1.5" />
            ) : (
              <Lock className="w-3 h-3 mr-1.5" />
            )}
            {hasAccess ? 'Download All Zones' : 'Offline Maps (Pro)'}
          </Button>

          {totalTiles > 0 && (
            <Button
              onClick={clearCache}
              disabled={clearing}
              variant="outline"
              size="sm"
              className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
              aria-label="Clear all cached map tiles"
            >
              {clearing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Trash2 className="w-3 h-3" />
              )}
            </Button>
          )}
        </div>

        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Downloads OpenStreetMap tiles at zoom levels 11–15 (neighbourhood → street level) for offline use during emergencies. Cached tiles persist across sessions.
        </p>
      </div>
    </>
  );
}