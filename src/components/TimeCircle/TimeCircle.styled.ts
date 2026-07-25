import styled, { keyframes } from "styled-components";
import { media } from "../../styles/media";

export const Circle = styled.div<{ $rotation: number }>`
  position: relative;
  width: 530px;
  height: 530px;
  border-radius: 50%;
  border: 2px dashed #ccc;
  transform: rotate(${(props) => props.$rotation}deg);
  transition: transform 0.6s ease;
  z-index: 2;

  ${media.lg} {
    margin-top: 65px;
    width: 400px;
    height: 400px;
  }
  ${media.md} {
    display: none;
  }
`;

export const Dot = styled.button<{ $active: boolean; $rotation: number }>`
  position: absolute;
  width: 6px;
  height: 6px;
  padding: 0;
  border: none;
  appearance: none;
  font: inherit;
  background-color: #42567a;
  border-radius: 50%;
  cursor: pointer;
  transform: rotate(${(props) => -props.$rotation}deg);
  display: flex;
  align-items: center;
  justify-content: center;
  /* Matches the dial's own 0.6s transform so the counter-rotation stays in
     lockstep and the numbers never tilt mid-turn. */
  transition: transform 0.6s ease, opacity 0.3s ease;
  z-index: ${(props) => (props.$active ? 2 : 1)};

  &:focus-visible {
    outline: none;
  }

  &:focus-visible::before {
    opacity: 1;
    background-color: #fff;
    border: 1px solid #42567a;
    outline: 2px solid #42567a;
    outline-offset: 2px;
  }

  &:focus-visible span {
    opacity: 1;
    transform: scale(1);
  }

  &::before {
    content: "";
    position: absolute;
    width: 56px;
    height: 56px;
    background-color: ${(props) => (props.$active ? "#fff" : "transparent")};
    border: ${(props) => (props.$active ? "1px solid #42567a" : "none")};
    border-radius: 50%;
    transition: all 0.3s ease;
    opacity: ${(props) => (props.$active ? 1 : 0)};
  }

  &:hover::before {
    opacity: 1;
    background-color: #fff;
    border: 1px solid #42567a;
  }

  span {
    opacity: ${(props) => (props.$active ? 1 : 0)};
    transform: scale(${(props) => (props.$active ? 1 : 0.6)});
    transition: opacity 0.3s ease, transform 0.3s ease;
    font-size: 20px;
    color: #42567a;
    z-index: 2;
  }

  &:hover span {
    opacity: 1;
    transform: scale(1);
  }
`;

const ShowName = keyframes`
  0% {
    opacity: 0;
  }
  100%{
    opacity: 1;
  }
`;

// A span rather than a heading: it labels the active dot inside a <button>,
// where flow content is not allowed. The explicit margin reproduces the
// heading's former user-agent margin so the label sits where it always did.
export const DotName = styled.span`
  position: absolute;
  left: 45px;
  margin: 20px 0;
  color: #42567a;
  font-family: "PT Sans";
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 30px;
  opacity: 0;

  animation: ${ShowName} 0.7s 1;
  animation-fill-mode: forwards;
  animation-delay: 0.65s;
`;
