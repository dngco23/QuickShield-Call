import React, { useState } from 'react';
import { motion } from 'framer-motion';

const moods = [
  { emoji: "😌", label: "Calm", color: "bg-accent" },
  { emoji: "😊", label: "Happy", color: "bg-secondary" },
  { emoji: "😐", label: "Okay", color: "bg-muted" },
  { emoji: "😔", label: "Low", color: "bg-primary/10" },
  { emoji: "😤", label: "Stressed", color: "bg-destructive/10" },
];

export default function MoodTracker() {
  const [selected, setSelected] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card rounded-2xl p-5 border border-border/50"
    >
      <h3 className="font-body font-medium text-foreground mb-4 text-sm">How are you feeling?</h3>
      <div className="flex justify-between gap-2">
        {moods.map((mood) => (
          <button
            key={mood.label}
            onClick={() => setSelected(mood.label)}
            className={`flex flex-col items-center gap-1.5 flex-1 py-3 rounded-xl transition-all duration-200 ${
              selected === mood.label 
                ? `${mood.color} ring-2 ring-primary/30 scale-105` 
                : 'hover:bg-muted/50'
            }`}
          >
            <span className="text-2xl">{mood.emoji}</span>
            <span className="text-xs text-muted-foreground font-body">{mood.label}</span>
          </button>
        ))}
      </div>
      {selected && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="text-xs text-muted-foreground mt-3 text-center font-body"
        >
          Logged ✓ Take care of yourself today
        </motion.p>
      )}
    </motion.div>
  );
}