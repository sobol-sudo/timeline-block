/**
 * jsdom ships no matchMedia at all, so `useMediaQuery` would throw on the
 * first render. This installs a small but real implementation: queries are
 * evaluated against a width the test controls, and changing that width fires
 * `change` on every list that flipped, exactly as a browser would.
 */

type Listener = (event: MediaQueryListEvent) => void;

const DEFAULT_WIDTH = 1440;

let currentWidth = DEFAULT_WIDTH;

interface Registration {
  list: MediaQueryList;
  query: string;
  matches: boolean;
  listeners: Set<Listener>;
}

let registrations: Registration[] = [];

const evaluate = (query: string, width: number): boolean => {
  const max = /\(\s*max-width:\s*(\d+)px\s*\)/.exec(query);
  if (max) return width <= Number(max[1]);
  const min = /\(\s*min-width:\s*(\d+)px\s*\)/.exec(query);
  if (min) return width >= Number(min[1]);
  throw new Error(`viewport helper cannot evaluate the query "${query}"`);
};

const install = (): void => {
  window.matchMedia = ((query: string) => {
    const registration: Registration = {
      query,
      matches: evaluate(query, currentWidth),
      listeners: new Set<Listener>(),
      list: null as unknown as MediaQueryList,
    };

    const list = {
      get matches() {
        return registration.matches;
      },
      media: query,
      onchange: null,
      addEventListener: (type: string, listener: Listener) => {
        if (type === "change") registration.listeners.add(listener);
      },
      removeEventListener: (type: string, listener: Listener) => {
        if (type === "change") registration.listeners.delete(listener);
      },
      addListener: (listener: Listener) => registration.listeners.add(listener),
      removeListener: (listener: Listener) =>
        registration.listeners.delete(listener),
      dispatchEvent: () => true,
    } as unknown as MediaQueryList;

    registration.list = list;
    registrations.push(registration);
    return list;
  }) as typeof window.matchMedia;
};

/** Sets the viewport width and notifies every query whose answer changed. */
export const setViewport = (width: number): void => {
  currentWidth = width;
  registrations.forEach((registration) => {
    const next = evaluate(registration.query, currentWidth);
    if (next === registration.matches) return;
    registration.matches = next;
    const event = { matches: next, media: registration.query } as MediaQueryListEvent;
    registration.listeners.forEach((listener) => listener(event));
  });
};

/** Drops every subscription and returns to the desktop default. */
export const resetViewport = (): void => {
  registrations = [];
  currentWidth = DEFAULT_WIDTH;
  install();
};

export const DESKTOP_WIDTH = DEFAULT_WIDTH;
export const MOBILE_WIDTH = 480;

install();
