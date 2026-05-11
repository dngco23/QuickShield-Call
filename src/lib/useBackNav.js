import { useNavigate } from 'react-router-dom';

/**
 * Returns a back-navigation function that pops the stack natively (navigate(-1))
 * but falls back to a specific path if there's no history to pop.
 *
 * Usage:
 *   const goBack = useBackNav('/settings');
 *   <button onClick={goBack}>Back</button>
 */
export function useBackNav(fallback = '/') {
  const navigate = useNavigate();
  return () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  };
}