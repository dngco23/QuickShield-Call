import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

// Tab roots never animate as a "push" — only sub-pages do
const TAB_ROOTS = ['/', '/journal', '/zones', '/insights', '/settings'];

const variants = {
  push: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-30%', opacity: 0 },
  },
  pop: {
    initial: { x: '-30%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
};

const transition = { type: 'tween', ease: [0.25, 0.46, 0.45, 0.94], duration: 0.28 };

/**
 * Wrap each page in this to get native-style push/pop animations.
 * Pass `direction="pop"` on pages that are navigated back to.
 * Tab switches use a simple fade.
 */
export default function PageTransition({ children, direction = 'push' }) {
  const location = useLocation();
  const isTabRoot = TAB_ROOTS.includes(location.pathname);
  const variant = isTabRoot ? variants.fade : variants[direction];

  return (
    <motion.div
      key={location.pathname}
      initial={variant.initial}
      animate={variant.animate}
      exit={variant.exit}
      transition={transition}
      style={{ position: 'relative', width: '100%', willChange: 'transform' }}
    >
      {children}
    </motion.div>
  );
}