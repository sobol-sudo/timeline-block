import React, { useLayoutEffect, useRef } from "react";
import {
  NavWrapper,
  CurrentSlide,
  ButtonsWrapper,
} from "./CircleNavigation.styled";
import Button from "@components/Button";
import { NavigationProps } from "@types";
import { COLORS } from "@constants";
import { VisuallyHidden } from "@styles/global";

const CircleNavigation: React.FC<NavigationProps> = ({
  activeIndex,
  onSelect,
  segments,
  controlsId,
}) => {
  const previousRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  // Set only on the render caused by pressing an arrow, and only when that
  // arrow held focus. Cleared unconditionally below, so it can never leak
  // into a render some other control caused.
  const pressed = useRef<HTMLButtonElement | null>(null);

  const step = (direction: -1 | 1): void => {
    const self = direction === -1 ? previousRef.current : nextRef.current;
    pressed.current = self && document.activeElement === self ? self : null;
    onSelect(activeIndex + direction);
  };

  // Stepping onto the first or last period disables the arrow that got you
  // there. The browser unfocuses an element the moment it becomes disabled
  // (verified in Chrome: activeElement falls back to <body>), so the arrow
  // that worked five times in a row silently ejects the keyboard user out of
  // the block on the sixth, and the next Tab restarts from the top of the
  // page. Hand focus to the opposite arrow, which the same press has just
  // made live. Runs on every render rather than on an activeIndex change:
  // the flag has to be consumed even in the renders it does not apply to.
  useLayoutEffect(() => {
    const self = pressed.current;
    pressed.current = null;
    if (!self || !self.disabled) return;

    const other = self === previousRef.current ? nextRef.current : previousRef.current;
    if (other && !other.disabled) other.focus();
  });

  const formatSlideNumber = (num: number): string => {
    return num < 10 ? `0${num}` : String(num);
  };

  return (
    <NavWrapper>
      <CurrentSlide>
        {/* "01/06" reads as a date to a screen reader, so the visible glyphs
            are hidden from the a11y tree and spelled out alongside. */}
        <span aria-hidden="true">
          {`${formatSlideNumber(activeIndex + 1)}/${formatSlideNumber(segments.length)}`}
        </span>
        <VisuallyHidden>
          {`Period ${activeIndex + 1} of ${segments.length}`}
        </VisuallyHidden>
      </CurrentSlide>
      <ButtonsWrapper>
        <Button
          text=""
          border={1}
          border_color={COLORS.PRIMARY}
          border_radius={50}
          bg={COLORS.TRANSPARENT}
          hover_bg={COLORS.WHITE}
          icon="/assets/left_arr.svg"
          width="fit-content"
          padding="10px 12px"
          onClick={() => step(-1)}
          disabled={activeIndex === 0}
          ariaLabel="Previous period"
          ariaControls={controlsId}
          ref={previousRef}
        />
        <Button
          text=""
          border={1}
          border_color={COLORS.PRIMARY}
          border_radius={50}
          bg={COLORS.TRANSPARENT}
          hover_bg={COLORS.WHITE}
          icon="/assets/right_arr.svg"
          width="fit-content"
          padding="10px 12px"
          onClick={() => step(1)}
          disabled={activeIndex + 1 === segments.length}
          ariaLabel="Next period"
          ariaControls={controlsId}
          ref={nextRef}
        />
      </ButtonsWrapper>
    </NavWrapper>
  );
};

export default CircleNavigation;
