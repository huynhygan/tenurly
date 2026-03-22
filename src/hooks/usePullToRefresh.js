import { useEffect, useRef, useState } from 'react';

/**
 * usePullToRefresh — attaches a native-feel pull-to-refresh gesture to a scrollable container.
 * Usage:
 *   const { containerRef, isRefreshing } = usePullToRefresh(refetchFn);
 *   <div ref={containerRef} className="overflow-y-auto h-full">…</div>
 */
export default function usePullToRefresh(onRefresh, { threshold = 70 } = {}) {
  const containerRef = useRef(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e) => {
      if (el.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
        pulling.current = true;
      }
    };

    const onTouchMove = (e) => {
      if (!pulling.current) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0 && el.scrollTop === 0) {
        e.preventDefault();
      }
    };

    const onTouchEnd = async (e) => {
      if (!pulling.current) return;
      pulling.current = false;
      const dy = e.changedTouches[0].clientY - startY.current;
      if (dy > threshold && !isRefreshing) {
        setIsRefreshing(true);
        try { await onRefresh(); } finally { setIsRefreshing(false); }
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [onRefresh, threshold, isRefreshing]);

  return { containerRef, isRefreshing };
}