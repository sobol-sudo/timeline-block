import React from "react";
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
          onClick={() => onSelect(activeIndex - 1)}
          disabled={activeIndex === 0}
          ariaLabel="Previous period"
          ariaControls={controlsId}
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
          onClick={() => onSelect(activeIndex + 1)}
          disabled={activeIndex + 1 === segments.length}
          ariaLabel="Next period"
          ariaControls={controlsId}
        />
      </ButtonsWrapper>
    </NavWrapper>
  );
};

export default CircleNavigation;
