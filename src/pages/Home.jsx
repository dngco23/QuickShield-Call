import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, Phone, AlertTriangle, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SearchBar from '@/components/wellness/SearchBar';
import QuoteWidget from '@/components/wellness/QuoteWidget';
import MoodTracker from '@/components/wellness/MoodTracker';
import WellnessCards from '@/components/wellness/WellnessCards';
import QuickActions from '@/components/wellness/QuickActions';
import BottomNav from '@/components/wellness/BottomNav';
import FakeCallOverlay from '@/components/FakeCallOverlay';
import HiddenSettings from '@/components/HiddenSettings';
import SOSButton from '@/components/SOSButton';
import CheckIn from '@/components/CheckIn';
import AudioRecorder from '@/components/AudioRecorder';
import StealthMode from '@/components/StealthMode';
import FamilyMembers from '@/components/FamilyMembers';
import { useSafety } from '@/lib/safetyContext.jsx';

export default function Home() {
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const { settings, startCheckIn, stealthMode } = useSafety();
  const [user, setUser] = useState(null);
  const { triggerCall } = useSafety();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };
    loadUser();
  }, []);

  if (stealthMode) {
    return <StealthMode />;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <FakeCallOverlay />
      <HiddenSettings />
      <CheckIn />
      <AudioRecorder />

      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <p className="text-sm text-muted-foreground font-body">{greeting}</p>
            <h1 className="font-display text-2xl font-semibold text-foreground mt-0.5">
              Quickshield Call
            </h1>
          </div>
          <div className="flex gap-2">
            <Link
              to="/parent-dashboard"
              className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center hover:opacity-80 transition-opacity"
              title="Parental Controls"
            >
              <Shield className="w-5 h-5 text-secondary-foreground" />
            </Link>
            <Link
              to="/settings"
              className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <SettingsIcon className="w-5 h-5 text-primary" />
            </Link>
          </div>
        </motion.div>

        <SearchBar />
      </div>

      {/* Content */}
      <div className="px-5 space-y-5">
        <QuoteWidget />
        <MoodTracker />
        <WellnessCards />
        <QuickActions />

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.43 }}
            onClick={triggerCall}
            className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-2xl p-4 hover:from-primary/30 hover:to-accent/30 transition-all active:scale-98"
          >
            <div className="flex items-center justify-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              <span className="font-body font-medium text-foreground text-sm">Fake Call</span>
            </div>
          </motion.button>
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.44 }}
            onClick={() => startCheckIn(15)}
            className="bg-gradient-to-r from-secondary/40 to-primary/20 border border-secondary/40 rounded-2xl p-4 hover:from-secondary/50 hover:to-primary/30 transition-all active:scale-98"
          >
            <div className="flex flex-col items-center justify-center gap-1">
              <span className="text-lg">🏠</span>
              <span className="font-body font-medium text-foreground text-sm">Check-In</span>
            </div>
          </motion.button>
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            onClick={() => navigate('/panic')}
            className="bg-gradient-to-r from-destructive/20 to-destructive/10 border border-destructive/30 rounded-2xl p-4 hover:from-destructive/30 hover:to-destructive/20 transition-all active:scale-98"
          >
            <div className="flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="font-body font-medium text-foreground text-sm">Panic</span>
            </div>
          </motion.button>
        </div>
        
        {/* SOS Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.46 }}
          className="bg-red-50 border border-red-100 rounded-2xl p-5"
        >
          <p className="text-xs font-medium text-red-400 uppercase tracking-wider text-center mb-4">Emergency SOS</p>
          <SOSButton
            emergencyContact1={user?.emergencyContact1Number}
            emergencyName1={user?.emergencyContact1Name}
            emergencyContact2={user?.emergencyContact2Number}
            emergencyName2={user?.emergencyContact2Name}
          />
          {!user?.emergencyContact1Number && !user?.emergencyContact2Number && (
            <Link to="/settings" className="text-xs text-red-400/70 text-center mt-3 font-body hover:text-red-400 transition-colors block">
              Set emergency contacts in Settings
            </Link>
          )}
        </motion.div>

        {/* Family Members */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.47 }}
          className="bg-card rounded-2xl border border-border/50 p-5"
        >
          <FamilyMembers />
        </motion.div>

        {/* Subtle daily tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.48 }}
          className="bg-muted/30 rounded-2xl p-4 border border-border/30"
        >
          <p className="text-xs text-muted-foreground font-body leading-relaxed">
            💡 <span className="font-medium text-foreground/70">Daily tip:</span> Try the 5-4-3-2-1 grounding technique — 
            notice 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you taste.
          </p>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}