import React, { useState } from "react";
import TimeCircle from "@components/TimeCircle/TimeCircle";
import Title from "@components/Title/Title";
import TimeSlider from "@components/TimeSlider/TimeSlider";
import MOCK_DATA from "@data/mock";
import CircleNavigation from "@components/CircleNavigation/CircleNavigation";
import { Wrapper } from "./TimelineBlock.styled";
import AnimatedYears from "@components/AnimatedYears/AnimatedYears";
import MobileNavigation from "@components/MobileNavigation/MobileNavigation";
import { useMediaQuery } from "@hooks/useMediaQuery";
import { BREAKPOINTS } from "@constants";

const TimelineBlock: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const isMobile = useMediaQuery(BREAKPOINTS.MOBILE);

  return (
    <Wrapper>
      <Title title="Historical\ndates" />
      <TimeCircle
        segments={MOCK_DATA}
        activeIndex={activeIndex}
        onSelect={setActiveIndex}
      />
      <AnimatedYears
        startYear={+MOCK_DATA[activeIndex].date_1}
        endYear={+MOCK_DATA[activeIndex].date_2}
      />
      {!isMobile && (
        <CircleNavigation
          segments={MOCK_DATA}
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
        />
      )}
      <TimeSlider activeIndex={activeIndex} segments={MOCK_DATA} />
      {isMobile && (
        <MobileNavigation
          segments={MOCK_DATA}
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
        />
      )}
    </Wrapper>
  );
};

export default TimelineBlock;
