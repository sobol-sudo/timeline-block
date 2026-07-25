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
  EmptyEvents,
} from "./TimeSlider.styled";
import { TimeSliderProps } from "@types";

const TimeSlider: React.FC<TimeSliderProps> = ({
  activeIndex,
  segments,
  id,
}) => {
  const segment = segments[activeIndex];

  if (!segment) return null;

  const events = segment.sliderData;

  return (
    <SwiperWrapper
      key={activeIndex}
      id={id}
      role="region"
      aria-label={`Key events, ${segment.name}`}
    >
      <TopicTitle>{segment.name}</TopicTitle>
      {events.length === 0 ? (
        // A period carrying no events used to collapse the slider to a bare
        // 1px strip, so the control that led here appeared to do nothing.
        <EmptyEvents>No events recorded for this period.</EmptyEvents>
      ) : (
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
          {events.map((slide) => (
            <SwiperSlide key={slide.date}>
              <SlideTitle>{slide.date}</SlideTitle>
              <SlideContent>{slide.text}</SlideContent>
            </SwiperSlide>
          ))}
        </StyledSwiper>
      )}
    </SwiperWrapper>
  );
};

export default TimeSlider;
