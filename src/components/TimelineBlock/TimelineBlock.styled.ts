import styled from "styled-components";
import { media } from "@styles/media";

// Shown when the block is handed no periods at all. Without it the tree
// reads date_1 off undefined and the whole page renders blank.
export const EmptyState = styled.p`
  color: #42567a;
  font-family: "PT Sans";
  font-size: 20px;
  line-height: 30px;
  margin: 0;
  padding: 60px 0;

  ${media.sm} {
    font-size: 15px;
    line-height: 20px;
  }
`;

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  position: relative;
  padding-top: 170px;
  padding-bottom: 104px;

  &::before {
    content: "";
    display: block;
    position: absolute;
    width: 100%;
    height: 1px;
    background: rgba(66, 86, 122, 0.1);
    top: 440px;
  }
  &::after {
    content: "";
    display: block;
    position: absolute;
    width: 1px;
    height: 100%;
    background: rgba(66, 86, 122, 0.1);
    left: 50%;
  }
  ${media.md} {
    align-items: flex-start;
    padding-top: 60px;
    gap: 56px;

    &::before {
      display: none;
    }
    &::after {
      display: none;
    }
  }
  ${media.xs} {
    gap: 10px;
    padding-bottom: 15px;
  }
`;
