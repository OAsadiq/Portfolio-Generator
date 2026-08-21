import { useEffect, useState } from 'react';

/**
 * One definition of "too small for the visual builder", shared by every surface that
 * routes around it. Previously each place decided for itself, which is how /edit could
 * bounce a phone into /builder and straight into the desktop wall.
 *
 * 900, not 1024: at 1024 a laptop with a half-width browser window was treated as a
 * phone, as was any tablet in portrait. Those users have a keyboard and a mouse — the
 * builder is usable for them, and the wall was pure loss.
 */
export const BUILDER_MIN_WIDTH = 900;

export function useIsMobile(breakpoint = BUILDER_MIN_WIDTH) {
  // Initialise from the real width rather than `false`. Starting false renders the
  // desktop branch for a frame, so a phone would flash the builder before being routed
  // away — which looks like a crash on a slow connection.
  const [isMobile, setIsMobile] = useState(
    () => (typeof window === 'undefined' ? false : window.innerWidth < breakpoint)
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);

  return isMobile;
}

/**
 * Decided once, on mount, and never re-evaluated.
 *
 * Use this for ROUTING (which editor someone gets), not for display. A live value would
 * swap the whole editor out mid-edit on a rotation: an iPhone Pro Max is 932px in
 * landscape, over the threshold, so turning the phone sideways while filling in the form
 * would replace it with the builder and lose what they had typed.
 */
export function useIsMobileOnce(breakpoint = BUILDER_MIN_WIDTH) {
  const [isMobile] = useState(
    () => (typeof window === 'undefined' ? false : window.innerWidth < breakpoint)
  );
  return isMobile;
}

export default useIsMobile;
