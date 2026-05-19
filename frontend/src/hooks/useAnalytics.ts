import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initGA4, trackEvent, trackPageView } from '../lib/analytics';

export { trackEvent };

export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    initGA4();
  }, []);

  useEffect(() => {
    trackPageView(`${location.pathname}${location.search}`);
  }, [location.pathname, location.search]);
}
