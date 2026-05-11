import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Indicator that sits at the top of a scroll container.
 * Pass pullProgress (0-1) and isRefreshing from usePullToRefresh.
 */
export default function PullToRefreshIndicator({ pullProgress, isRefreshing }) {
  const show = pullProgress > 0.05 || isRefreshing;
  if (!show) return null;

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center py-3"
    >
      <div
        className="w-8 h-8 rounded-full bg-card border border-border shadow flex items-center justify-center"
        style={{ transform: `scale(${Math.max(0.5, pullProgress)})` }}
      >
        {isRefreshing ? (
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
        ) : (
          <svg
            className="w-4 h-4 text-primary transition-transform"
            style={{ transform: `rotate(${pullProgress * 360}deg)` }}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        )}
      </div>
    </motion.div>
  );
}