import React, { useCallback, useId, useState } from "react";
import TimeCircle from "@components/TimeCircle/TimeCircle";
import Title from "@components/Title/Title";
import TimeSlider from "@components/TimeSlider/TimeSlider";
import MOCK_DATA from "@data/mock";
import CircleNavigation from "@components/CircleNavigation/CircleNavigation";
import { Wrapper, EmptyState } from "./TimelineBlock.styled";
import AnimatedYears from "@components/AnimatedYears/AnimatedYears";
import MobileNavigation from "@components/MobileNavigation/MobileNavigation";
import { useMediaQuery } from "@hooks/useMediaQuery";
import { BREAKPOINTS } from "@constants";
import { TimelineBlockProps } from "@types";
import { VisuallyHidden } from "@styles/global";

const TimelineBlock: React.FC<TimelineBlockProps> = ({
  segments = MOCK_DATA,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const isMobile = useMediaQuery(BREAKPOINTS.MOBILE);
  // useId rather than a literal: several blocks can share a page, and every
  // aria-controls has to resolve to its own slider.
  const panelId = `timeline-events-${useId()}`;

  const lastIndex = Math.max(segments.length - 1, 0);

  // Clamp every selection so no caller can push the index out of range and
  // leave the tree rendering an undefined segment.
  const selectIndex = useCallback(
    (index: number) => {
      setActiveIndex(Math.min(Math.max(index, 0), Math.max(segments.length - 1, 0)));
    },
    [segments.length]
  );

  // A shorter `segments` array can strand the stored index past the end before
  // any handler runs, so clamp on read as well as on write.
  const safeIndex = Math.min(activeIndex, lastIndex);
  const activeSegment = segments[safeIndex];

  if (!activeSegment) {
    return (
      <Wrapper>
        <Title title="Historical\ndates" />
        <EmptyState role="status">No periods to show.</EmptyState>
      </Wrapper>
    );
  }

  const eventCount = activeSegment.sliderData.length;

  return (
    <Wrapper>
      <Title title="Historical\ndates" />
      {/* Choosing a period swaps the years and the slider with no audible
          cue. This sits outside the keyed slider so it survives those swaps
          and the change is actually announced. */}
      <VisuallyHidden aria-live="polite">
        {`${activeSegment.name}, ${activeSegment.date_1} to ${activeSegment.date_2}. ` +
          `${eventCount} ${eventCount === 1 ? "event" : "events"}.`}
      </VisuallyHidden>
      <TimeCircle
        segments={segments}
        activeIndex={safeIndex}
        onSelect={selectIndex}
        controlsId={panelId}
      />
      <AnimatedYears
        startYear={+activeSegment.date_1}
        endYear={+activeSegment.date_2}
      />
      {!isMobile && (
        <CircleNavigation
          segments={segments}
          activeIndex={safeIndex}
          onSelect={selectIndex}
          controlsId={panelId}
        />
      )}
      <TimeSlider activeIndex={safeIndex} segments={segments} id={panelId} />
      {isMobile && (
        <MobileNavigation
          segments={segments}
          activeIndex={safeIndex}
          onSelect={selectIndex}
          controlsId={panelId}
        />
      )}
    </Wrapper>
  );
};

export default TimelineBlock;
