import React, { useEffect, useState, useMemo } from "react";
import { Dot, DotName, Circle } from "./TimeCircle.styled";
import { useMediaQuery } from "@hooks/useMediaQuery";
import { TimeCircleProps } from "@types";
import { BREAKPOINTS, CIRCLE_CONFIG } from "@constants";

const TimeCircle: React.FC<TimeCircleProps> = ({
  segments,
  activeIndex,
  onSelect,
  controlsId,
}) => {
  const isMobile = useMediaQuery(BREAKPOINTS.TABLET);
  const segmentAngle = useMemo(() => 360 / segments.length, [segments.length]);
  
  const radius = isMobile ? CIRCLE_CONFIG.MOBILE_RADIUS : CIRCLE_CONFIG.DEFAULT_RADIUS;
  const center = isMobile ? CIRCLE_CONFIG.MOBILE_RADIUS : CIRCLE_CONFIG.DEFAULT_RADIUS;

  const [rotation, setRotation] = useState<number>(CIRCLE_CONFIG.INITIAL_ROTATION);
  const [prevIndex, setPrevIndex] = useState<number>(0);

  useEffect(() => {
    if (activeIndex === prevIndex) return;

    const delta = activeIndex - prevIndex;
    let shortestPath = delta;

    if (Math.abs(delta) > segments.length / 2) {
      shortestPath =
        delta > 0 ? delta - segments.length : delta + segments.length;
    }

    setRotation((prevRotation) => prevRotation - shortestPath * segmentAngle);
    setPrevIndex(activeIndex);
  }, [activeIndex, segments.length, segmentAngle, prevIndex]);

  // 360 / 0 is Infinity, which would place every dot at NaN.
  if (segments.length === 0) return null;

  return (
    <Circle $rotation={rotation} role="group" aria-label="Time periods">
      {segments.map((segment, index) => {
        const label = `${segment.date_1} – ${segment.date_2}`;
        const angle = segmentAngle * index + CIRCLE_CONFIG.START_ANGLE;
        const radians = (angle * Math.PI) / 180;
        const x = center + radius * Math.cos(radians) - CIRCLE_CONFIG.DOT_OFFSET;
        const y = center + radius * Math.sin(radians) - CIRCLE_CONFIG.DOT_OFFSET;

        return (
          <Dot
            key={index}
            type="button"
            $active={index === activeIndex}
            style={{ left: `${x}px`, top: `${y}px` }}
            onClick={() => onSelect(index)}
            $rotation={rotation}
            title={label}
            aria-label={`${segment.name}, ${segment.date_1}–${segment.date_2}`}
            aria-current={index === activeIndex ? "true" : undefined}
            aria-controls={controlsId}
          >
            <span>{index + 1}</span>
            {index === activeIndex && <DotName>{segment.name}</DotName>}
          </Dot>
        );
      })}
    </Circle>
  );
};

export default TimeCircle;
