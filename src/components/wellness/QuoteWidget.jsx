import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const quotes = [
  { text: "You are enough just as you are.", author: "Meghan Markle" },
  { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
  { text: "Inhale confidence, exhale doubt.", author: "Daily Affirmation" },
  { text: "She remembered who she was and the game changed.", author: "Lalah Delia" },
  { text: "You have been assigned this mountain to show others it can be moved.", author: "Mel Robbins" },
  { text: "Take a deep breath. You are exactly where you need to be.", author: "Daily Wellness" },
  { text: "Your calm mind is the ultimate weapon against your challenges.", author: "Bryant McGill" },
];

export default function QuoteWidget() {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const day = new Date().getDate();
    setQuoteIndex(day % quotes.length);
  }, []);

  const quote = quotes[quoteIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-gradient-to-br from-primary/10 via-accent/30 to-secondary/40 rounded-2xl p-6 relative overflow-hidden"
    >
      <Sparkles className="w-5 h-5 text-primary/50 mb-3" />
      <p className="font-display text-lg leading-relaxed text-foreground/90 italic">
        "{quote.text}"
      </p>
      <p className="text-sm text-muted-foreground mt-3 font-body">— {quote.author}</p>
      <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-primary/5" />
    </motion.div>
  );
}