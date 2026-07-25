import React from "react";
import { SwiperSlide } from "swiper/react";
import { A11y, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import {
  StyledSwiper,
  SlideTitle,
  SlideContent,
  TopicTitle,
  SwiperWrapper,
} from "./TimeSlider.styled";
import { TimeSliderProps } from "@types";

const TimeSlider: React.FC<TimeSliderProps> = ({ activeIndex, segments }) => {
  return (
    <SwiperWrapper key={activeIndex}>
      <TopicTitle>{segments[activeIndex].name}</TopicTitle>
      <StyledSwiper
        modules={[Navigation, A11y]}
        slidesPerView={3}
        spaceBetween={80}
        navigation
        a11y={{
          prevSlideMessage: "Previous events",
          nextSlideMessage: "Next events",
          containerMessage: "Key events for the selected period",
        }}
        breakpoints={{
          0: { slidesPerView: 1.5 },
          480: { slidesPerView: 2, spaceBetween: 10 },
          576: { slidesPerView: 2, spaceBetween: 20 },
          758: { slidesPerView: 2, spaceBetween: 80 },
          1200: { slidesPerView: 3 },
        }}
      >
        {segments[activeIndex].sliderData.map((slide) => (
          <SwiperSlide key={slide.date}>
            <SlideTitle>{slide.date}</SlideTitle>
            <SlideContent>{slide.text}</SlideContent>
          </SwiperSlide>
        ))}
      </StyledSwiper>
    </SwiperWrapper>
  );
};

export default TimeSlider;
