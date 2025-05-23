import { useCallback, useEffect, useState } from 'react';

interface CountdownConfig {
  duration: number;
  onComplete?: () => void;
  onTick?: (remaining: number) => void;
  enabled?: boolean;
  interval?: number;
}

const useCountdown = ({ duration, onComplete, onTick, enabled = true, interval = 1000 }: CountdownConfig) => {
  const [remaining, setRemaining] = useState(duration);

  const handleTick = useCallback(
    (prev: number) => {
      const next = prev - 1;
      if (next <= 0) {
        onComplete?.();
        return 0;
      }
      onTick?.(next);
      return next;
    },
    [onComplete, onTick]
  );

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    if (enabled && remaining > 0) {
      timer = setInterval(() => {
        setRemaining(prev => {
          const next = handleTick(prev);
          if (next <= 0) {
            clearInterval(timer);
          }
          return next;
        });
      }, interval);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [enabled, interval, onComplete, onTick, remaining]);

  // Reset remaining time when duration changes or when enabled changes from false to true
  useEffect(() => {
    if (enabled) {
      setRemaining(duration);
    }
  }, [duration, enabled]);

  return remaining;
};

export { useCountdown, type CountdownConfig };
