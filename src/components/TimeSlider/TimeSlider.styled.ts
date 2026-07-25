import styled, { keyframes } from "styled-components";
import { Swiper } from "swiper/react";
import { media } from "@styles/media";

const Show = keyframes`
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100%{
    opacity: 1;
    transform: translateY(0);
  }
`;

export const StyledSwiper = styled(Swiper)`
  width: calc(100% - 160px);
  padding: 16px 80px 0 80px;
  overflow: hidden;
  opacity: 0;
  transform: translateY(20px);

  animation: ${Show} 1.5s 1;
  animation-fill-mode: forwards;

  .swiper-wrapper {
    width: 100%;
  }

  .swiper-button-prev,
  .swiper-button-next {
    color: #3877ee;
    width: 40px;
    height: 40px;
    background: #fff;
    border-radius: 50%;
    filter: drop-shadow(0px 0px 15px rgba(56, 119, 238, 0.1));
  }

  .swiper-button-prev svg,
  .swiper-button-next svg {
    display: none !important;
  }

  .swiper-button-prev::after {
    content: url("/assets/swiper_left_arr.svg");
    width: 8px;
    height: 12px;
    font-size: 12px;
  }

  .swiper-button-next::after {
    content: url("/assets/swiper_right_arr.svg");
    width: 8px;
    height: 12px;
    font-size: 12px;
  }
  .swiper-button-disabled {
    opacity: 0;
  }

  .swiper-slide {
    cursor: grab;
    user-select: none;

    &:active {
      cursor: grabbing;
    }
  }

  ${media.md} {
    padding: 0;
    width: 100%;
    border-top: 1px solid #c7cdd9;
    .swiper-button-prev,
    .swiper-button-next {
      display: none;
    }
  }
`;
export const SlideTitle = styled.h3`
  color: #3877ee;
  font-family: "Bebas Neue";
  font-size: 25px;
  font-style: normal;
  font-weight: 400;
  line-height: 120%;
  text-transform: uppercase;
  margin-bottom: 15px;
`;
export const SlideContent = styled.p`
  color: #42567a;
  font-family: "PT Sans";
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: 30px;
  margin: 0;

  ${media.sm} {
    font-size: 15px;
    line-height: 20px;
  }
`;

export const TopicTitle = styled.h2`
  color: #42567a;
  font-family: "PT Sans";
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 30px;
  display: none;
  margin-bottom: 30px;
  opacity: 0;
  transform: translateY(20px);

  animation: ${Show} 1.5s 1;
  animation-fill-mode: forwards;
  ${media.md} {
    display: block;
  }
`;

export const SwiperWrapper = styled.div`
  width: 100%;
`;

export const EmptyEvents = styled.p`
  color: #42567a;
  font-family: "PT Sans";
  font-size: 20px;
  line-height: 30px;
  margin: 0;
  padding: 16px 80px 0 80px;
  opacity: 0;
  transform: translateY(20px);

  animation: ${Show} 1.5s 1;
  animation-fill-mode: forwards;

  ${media.md} {
    padding: 16px 0 0 0;
    border-top: 1px solid #c7cdd9;
  }
  ${media.sm} {
    font-size: 15px;
    line-height: 20px;
  }
`;
