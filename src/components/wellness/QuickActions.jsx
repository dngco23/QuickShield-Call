import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Sun, CloudRain, Coffee } from 'lucide-react';
import { useSafety } from '@/lib/safetyContext.jsx';

export default function QuickActions() {
  const { triggerCall } = useSafety();
  const [tapCount, setTapCount] = React.useState(0);
  const tapTimer = React.useRef(null);

  // Rapid-tap the "Meditate" button 5 times to trigger a call
  const handleMeditateTap = () => {
    setTapCount((prev) => {
      const newCount = prev + 1;
      clearTimeout(tapTimer.current);

      if (newCount >= 5) {
        triggerCall();
        return 0;
      }

      tapTimer.current = setTimeout(() => {
        setTapCount(0);
      }, 1200);

      return newCount;
    });
  };

  const actions = [
    { icon: Leaf, label: "Meditate", onClick: handleMeditateTap },
    { icon: Sun, label: "Gratitude", onClick: () => {} },
    { icon: CloudRain, label: "Sounds", onClick: () => {} },
    { icon: Coffee, label: "Routine", onClick: () => {} },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <h3 className="font-body font-medium text-foreground mb-3 text-sm">Quick Start</h3>
      <div className="flex gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className="flex-1 flex flex-col items-center gap-2 py-4 bg-card border border-border/50 rounded-2xl hover:bg-muted/30 transition-all active:scale-95"
          >
            <action.icon className="w-5 h-5 text-primary/70" />
            <span className="text-xs text-muted-foreground font-body">{action.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}