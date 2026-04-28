import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook que detecta inactividad del usuario y ejecuta un callback tras el tiempo especificado.
 * Reinicia el temporizador ante cualquier evento de interacción (mouse, teclado, touch, scroll).
 *
 * @param onTimeout - Función a ejecutar cuando se agota el tiempo de inactividad
 * @param timeoutMs - Tiempo de inactividad en milisegundos (default: 10 minutos)
 */
export function useInactivityTimeout(
  onTimeout: () => void,
  timeoutMs: number = 10 * 60 * 1000
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onTimeoutRef = useRef(onTimeout);

  // Mantener la referencia actualizada sin re-registrar eventos
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      onTimeoutRef.current();
    }, timeoutMs);
  }, [timeoutMs]);

  useEffect(() => {
    const events = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'touchmove',
      'scroll',
      'wheel',
      'click',
    ];

    // Iniciar el temporizador al montar
    resetTimer();

    // Registrar eventos de actividad
    events.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [resetTimer]);
}
