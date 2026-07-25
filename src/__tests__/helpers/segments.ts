import { TimelineSegment } from "@types";

/** Predictable periods for tests that care about count rather than content. */
export const makeSegments = (count: number): TimelineSegment[] =>
  Array.from({ length: count }, (_, index) => ({
    name: `Period ${index + 1}`,
    date_1: String(2000 + index * 2),
    date_2: String(2001 + index * 2),
    sliderData: [{ date: 2000 + index * 2, text: `Event ${index + 1}` }],
  }));
