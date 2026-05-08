import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Settings as SettingsIcon, Phone } from 'lucide-react';
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
import { useSafety } from '@/lib/safetyContext.jsx';

export default function Home() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const { settings } = useSafety();
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

  return (
    <div className="min-h-screen bg-background pb-24">
      <FakeCallOverlay />
      <HiddenSettings />

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
              Bloom
            </h1>
          </div>
          <Link
            to="/settings"
            className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center hover:opacity-80 transition-opacity"
          >
            <SettingsIcon className="w-5 h-5 text-primary" />
          </Link>
        </motion.div>

        <SearchBar />
      </div>

      {/* Content */}
      <div className="px-5 space-y-5">
        <QuoteWidget />
        <MoodTracker />
        <WellnessCards />
        <QuickActions />

        {/* Fake Call Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.43 }}
          onClick={triggerCall}
          className="w-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-2xl p-4 hover:from-primary/30 hover:to-accent/30 transition-all active:scale-98"
        >
          <div className="flex items-center justify-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            <span className="font-body font-medium text-foreground">Fake Call</span>
          </div>
        </motion.button>
        
        {/* SOS Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-red-50 border border-red-100 rounded-2xl p-5"
        >
          <p className="text-xs font-medium text-red-400 uppercase tracking-wider text-center mb-4">Emergency SOS</p>
          <SOSButton
            emergencyContact={user?.emergencyContactNumber}
            emergencyName={user?.emergencyContactName}
          />
          {!user?.emergencyContactNumber && (
            <Link to="/settings" className="text-xs text-red-400/70 text-center mt-3 font-body hover:text-red-400 transition-colors block">
              Set an emergency contact in Settings
            </Link>
          )}
        </motion.div>

        {/* Subtle daily tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
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