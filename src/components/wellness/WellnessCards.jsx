import React from 'react';
import { motion } from 'framer-motion';
import { Wind, Moon, Heart, Droplets } from 'lucide-react';

const cards = [
  { icon: Wind, label: "Breathe", value: "4-7-8", desc: "Breathing exercise", bg: "bg-primary/8" },
  { icon: Moon, label: "Sleep", value: "7.5h", desc: "Last night", bg: "bg-accent/60" },
  { icon: Heart, label: "Heart", value: "72", desc: "Avg BPM", bg: "bg-secondary" },
  { icon: Droplets, label: "Water", value: "5/8", desc: "Glasses today", bg: "bg-primary/5" },
];

export default function WellnessCards() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.05 }}
          className={`${card.bg} rounded-2xl p-4 cursor-default`}
        >
          <card.icon className="w-5 h-5 text-primary/60 mb-2" />
          <p className="text-xl font-semibold text-foreground font-body">{card.value}</p>
          <p className="text-xs text-muted-foreground font-body mt-0.5">{card.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}