import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls to the top of the page on every route change.
 * Without this, React Router preserves scroll position across navigations,
 * so a new page can open part-way down. Also disables the browser's automatic
 * scroll restoration so reloads land at the top too.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
