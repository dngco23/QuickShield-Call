import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, AlertCircle, Send, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { base44 } from '@/api/base44Client';
import { useSafety } from '@/lib/safetyContext.jsx';
import { Button } from '@/components/ui/button';

// Fix leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

export default function PanicMode() {
  const navigate = useNavigate();
  const { settings, activeCheckIn } = useSafety();
  const [location, setLocation] = useState(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to load user:', error);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.error('Geolocation error:', error)
      );
    }
  }, []);

  const handleStopRecording = () => {
    // Recording is managed by AudioRecorder component
    // This just provides UI feedback
    alert('Recording stopped');
  };

  const handleSendUpdate = async () => {
    if (!message.trim() || !user?.emergencyContactNumber) {
      alert('Please enter a message and set an emergency contact');
      return;
    }

    setIsSending(true);
    try {
      const finalMessage = `${message}\n\nLocation: ${location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Unavailable'}`;
      
      await base44.functions.invoke('sendSOSSms', {
        to: user.emergencyContactNumber,
        message: finalMessage
      });

      setMessage('');
      alert('Emergency update sent!');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-border/50"
      >
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <h1 className="font-display text-xl font-semibold text-foreground">Panic Mode</h1>
        </div>
      </motion.div>

      {/* Map */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex-1 bg-muted relative overflow-hidden"
      >
        {location ? (
          <MapContainer
            center={[location.lat, location.lng]}
            zoom={16}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            <Marker position={[location.lat, location.lng]}>
              <Popup>Your current location</Popup>
            </Marker>
          </MapContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Getting your location...</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border-t border-border/50 p-5 space-y-4"
      >
        {/* Stop Recording Button */}
        <Button
          onClick={handleStopRecording}
          className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
        >
          Stop Recording
        </Button>

        {/* Message Box */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Emergency Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your emergency message..."
            maxLength={160}
            className="w-full h-20 px-3 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground text-sm font-body resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">{message.length}/160</p>
            {user?.emergencyContactNumber && (
              <p className="text-xs text-muted-foreground">
                To: {user.emergencyContactName || user.emergencyContactNumber}
              </p>
            )}
          </div>
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSendUpdate}
          disabled={isSending || !message.trim() || !user?.emergencyContactNumber}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {isSending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Emergency Update
            </>
          )}
        </Button>

        {!user?.emergencyContactNumber && (
          <p className="text-xs text-destructive text-center">
            Please set an emergency contact in Settings
          </p>
        )}
      </motion.div>
    </div>
  );
}