import React from "react";
import {
  NavWrapper,
  CurrentSlide,
  ButtonsWrapper,
} from "./CircleNavigation.styled";
import Button from "@components/Button";
import { NavigationProps } from "@types";
import { COLORS } from "@constants";

const CircleNavigation: React.FC<NavigationProps> = ({
  activeIndex,
  onSelect,
  segments,
}) => {
  const formatSlideNumber = (num: number): string => {
    return num < 10 ? `0${num}` : String(num);
  };

  return (
    <NavWrapper>
      <CurrentSlide>
        {`${formatSlideNumber(activeIndex + 1)}/${formatSlideNumber(segments.length)}`}
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
        />
      </ButtonsWrapper>
    </NavWrapper>
  );
};

export default CircleNavigation;
