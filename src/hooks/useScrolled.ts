import { useEffect, useState } from "react";

/**
 * Returns `true` once the page has scrolled past `threshold` pixels,
 * and `false` only when it scrolls back below `threshold - hysteresis`.
 *
 * The hysteresis band prevents the header from flickering at the boundary,
 * giving the collapse/expand animation time to complete gracefully.
 */
export function useScrolled(threshold = 80, hysteresis = 24): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled((prev) => {
        if (!prev && y > threshold) return true;
        if (prev && y < threshold - hysteresis) return false;
        return prev;
      });
    };

    // Run once on mount in case page is already scrolled (e.g. browser back)
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold, hysteresis]);

  return scrolled;
}
