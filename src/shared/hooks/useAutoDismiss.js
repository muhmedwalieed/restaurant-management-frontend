import { useEffect, useRef, useState } from 'react';

/**
 * Returns [message, setMessage] where the message auto-clears after `delay` ms.
 * Used for success/toast-style messages (5s default).
 */
export const useAutoDismiss = (delay = 5000) => {
  const [message, setMessage] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (message) {
      timerRef.current = setTimeout(() => setMessage(null), delay);
    }
    return () => clearTimeout(timerRef.current);
  }, [message, delay]);

  return [message, setMessage];
};