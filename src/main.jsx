import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Filter out expected Base44 SDK console noise that triggers the preview
// error overlay for non-fatal backend states (e.g. app not provisioned in
// preview environments, auth required, user not registered). The actual
// errors are still thrown and handled by AuthContext / TrialContext.
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  const SUPPRESSED_PATTERNS = [
    /App not found/i,
    /^Error data:/,
    /\[Base44 SDK Error\]/i,
    /Failed to load trial info/i,
    /App state check failed/i,
  ];

  console.error = (...args) => {
    try {
      const firstArg = args[0];
      const haystack = typeof firstArg === 'string'
        ? firstArg
        : (firstArg && typeof firstArg === 'object'
            ? JSON.stringify(firstArg)
            : String(firstArg ?? ''));

      if (SUPPRESSED_PATTERNS.some((pattern) => pattern.test(haystack))) {
        if (import.meta.env.DEV) {
          console.warn('[Suppressed Base44 SDK error]', ...args);
        }
        return;
      }
    } catch {
      // If anything goes wrong in the filter, fall through to original.
    }
    originalConsoleError.apply(console, args);
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
