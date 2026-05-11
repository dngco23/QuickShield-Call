import { useState, useEffect, useRef } from 'react';

/**
 * usePullToRefresh — attach to any scrollable ref.
 * Returns { isPulling, pullProgress (0-1), isRefreshing }
 */
export function usePullToRefresh(scrollRef, onRefresh, threshold = 70) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullY, setPullY] = useState(0);
  const startY = useRef(null);
  const pulling = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onTouchStart = (e) => {
      if (el.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
        pulling.current = true;
      }
    };

    const onTouchMove = (e) => {
      if (!pulling.current || startY.current === null) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta > 0) {
        e.preventDefault();
        setPullY(Math.min(delta, threshold * 1.5));
      } else {
        pulling.current = false;
        setPullY(0);
      }
    };

    const onTouchEnd = async () => {
      if (!pulling.current) return;
      pulling.current = false;
      if (pullY >= threshold) {
        setIsRefreshing(true);
        setPullY(0);
        try { await onRefresh(); } finally { setIsRefreshing(false); }
      } else {
        setPullY(0);
      }
      startY.current = null;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [scrollRef, onRefresh, threshold, pullY]);

  return {
    isPulling: pullY > 0,
    pullProgress: Math.min(pullY / threshold, 1),
    isRefreshing,
    pullY,
  };
}