export interface SegmentData {
  date: number;
  text: string;
}

export interface TimelineSegment {
  name: string;
  date_1: string;
  date_2: string;
  sliderData: SegmentData[];
}

export interface TimelineBlockProps {
  /** Periods to render. Defaults to the demo data in `src/data/mock.ts`. */
  segments?: TimelineSegment[];
}

export interface TimeCircleProps {
  segments: TimelineSegment[];
  activeIndex: number;
  onSelect: (index: number) => void;
  /** id of the panel these points swap, for `aria-controls`. */
  controlsId?: string;
}

export interface NavigationProps {
  segments: TimelineSegment[];
  activeIndex: number;
  onSelect: (index: number) => void;
  /** id of the panel these controls swap, for `aria-controls`. */
  controlsId?: string;
}

export interface TimeSliderProps {
  segments: TimelineSegment[];
  activeIndex: number;
  /** Stable id so the period controls can point at this panel. */
  id?: string;
}
