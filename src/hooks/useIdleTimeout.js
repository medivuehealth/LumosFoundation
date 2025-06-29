import { useEffect, useRef } from 'react';
import config from '../config';

const useIdleTimeout = (timeout, onTimeout) => {
  const timeoutId = useRef(null);

  const resetTimer = () => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    timeoutId.current = setTimeout(onTimeout, timeout);
  };

  useEffect(() => {
    // Events that reset the timer
    const events = [
      'mousemove',
      'mousedown',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Setup event listeners
    const eventHandler = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, eventHandler);
    });

    // Initial timer setup
    resetTimer();

    // Cleanup
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, eventHandler);
      });
    };
  }, [timeout, onTimeout]);

  return resetTimer;
};

export default useIdleTimeout; 