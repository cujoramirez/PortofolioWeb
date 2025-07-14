// useSupressReducedMotionWarning.js
import { useEffect } from 'react';

export function useSuppressReducedMotionWarning() {
  useEffect(() => {
    // Store the original console.error function
    const originalConsoleError = console.error;
    
    // Override console.error to filter out the specific warning
    console.error = (...args) => {
      // Check if this is the reduced motion warning
      if (
        args[0] && 
        typeof args[0] === 'string' && 
        args[0].includes('Reduced Motion') && 
        args[0].includes('enabled on your device')
      ) {
        // Ignore this specific warning
        return;
      }
      
      // Otherwise, pass through to original console.error
      originalConsoleError.apply(console, args);
    };
    
    // Restore original console.error on cleanup
    return () => {
      console.error = originalConsoleError;
    };
  }, []);
}
