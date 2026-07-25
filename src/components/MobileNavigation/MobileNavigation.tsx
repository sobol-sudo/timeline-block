import React from "react";
import CircleNavigation from "@components/CircleNavigation/CircleNavigation";
import { Wrapper, PaginationWrapper } from "./MobileNavigation.styled";
import Button from "@components/Button";
import { NavigationProps } from "@types";
import { COLORS } from "@constants";

const MobileNavigation: React.FC<NavigationProps> = ({
  activeIndex,
  onSelect,
  segments,
}) => {
  return (
    <Wrapper>
      <CircleNavigation
        segments={segments}
        activeIndex={activeIndex}
        onSelect={onSelect}
      />
      <PaginationWrapper>
        {segments.map((topic, index) => (
          <Button
            key={topic.name}
            text=""
            border={0}
            border_color={COLORS.PRIMARY}
            border_radius={50}
            bg={
              activeIndex === index
                ? COLORS.PRIMARY_OPACITY_100
                : COLORS.PRIMARY_OPACITY_40
            }
            hover_bg={COLORS.PRIMARY_OPACITY_100}
            width="6px"
            padding="3px"
            onClick={() => onSelect(index)}
            disabled={false}
            ariaLabel={`Go to ${topic.name}`}
            ariaCurrent={activeIndex === index}
          />
        ))}
      </PaginationWrapper>
    </Wrapper>
  );
};

export default MobileNavigation;
