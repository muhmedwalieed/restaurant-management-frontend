import { useEffect, useRef, useState } from 'react';

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
