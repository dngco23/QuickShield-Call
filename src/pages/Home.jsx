import React from 'react';
import { motion } from 'framer-motion';
import SearchBar from '@/components/wellness/SearchBar';
import QuoteWidget from '@/components/wellness/QuoteWidget';
import MoodTracker from '@/components/wellness/MoodTracker';
import WellnessCards from '@/components/wellness/WellnessCards';
import QuickActions from '@/components/wellness/QuickActions';
import BottomNav from '@/components/wellness/BottomNav';
import FakeCallOverlay from '@/components/FakeCallOverlay';
import HiddenSettings from '@/components/HiddenSettings';

export default function Home() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

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
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center">
            <span className="text-lg">🌸</span>
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