import { useEffect, useState } from "react";

/**
 * Anima un número desde 0 hasta `end` durante `duration` ms al montar el componente.
 */
export function useCountUp(end: number, duration = 1800, decimals = 0) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(end * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);

  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
