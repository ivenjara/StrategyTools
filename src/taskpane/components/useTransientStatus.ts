import { useCallback, useRef, useState } from "react";

/**
 * Small helper for the inline "✓" statuses that appear in section
 * headers for a moment after an action succeeds.
 */
export function useTransientStatus(durationMs = 2500): [string | null, (message: string) => void] {
  const [status, setStatus] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (message: string) => {
      setStatus(message);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setStatus(null), durationMs);
    },
    [durationMs]
  );

  return [status, show];
}
