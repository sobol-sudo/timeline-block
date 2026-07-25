import { useEffect, useState } from "react";

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    // Re-read on subscribe. The value that seeded state was sampled during
    // render; if the viewport crossed the breakpoint between that render and
    // this effect, the change event fired before the listener existed and the
    // hook would stay stale for the rest of the component's life.
    setMatches(media.matches);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
};
