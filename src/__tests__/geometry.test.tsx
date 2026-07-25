import React from "react";
import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TimeCircle from "@components/TimeCircle/TimeCircle";
import TimelineBlock from "@components/TimelineBlock/TimelineBlock";
import { CIRCLE_CONFIG } from "@constants";
import { makeSegments } from "./helpers/segments";
import { rotationOf, transformTransitionSeconds } from "./helpers/styles";

/**
 * The dial is pure trigonometry rendered into inline `left`/`top` and a pair
 * of counter-rotating transforms. Nothing about it is visible to a DOM query,
 * so the numbers are read back out and checked against the geometry they are
 * supposed to describe.
 */

const CENTER = CIRCLE_CONFIG.DEFAULT_RADIUS;

interface Polar {
  radius: number;
  degrees: number;
}

const polarPositions = (container: HTMLElement): Polar[] =>
  Array.from(container.querySelectorAll("button")).map((dot) => {
    const x =
      parseFloat(dot.style.left) + CIRCLE_CONFIG.DOT_OFFSET - CENTER;
    const y = parseFloat(dot.style.top) + CIRCLE_CONFIG.DOT_OFFSET - CENTER;
    return {
      radius: Math.hypot(x, y),
      degrees: (Math.atan2(y, x) * 180) / Math.PI,
    };
  });

const gapAfter = (from: number, to: number): number =>
  ((to - from) % 360 + 360) % 360;

describe("dial geometry", () => {
  it.each([3, 4, 6, 7])(
    "spreads %i points evenly around the circle starting at the top",
    (count) => {
      const { container } = render(
        <TimeCircle
          segments={makeSegments(count)}
          activeIndex={0}
          onSelect={() => undefined}
        />
      );

      const points = polarPositions(container);
      expect(points).toHaveLength(count);

      points.forEach(({ radius }) => {
        expect(radius).toBeCloseTo(CIRCLE_CONFIG.DEFAULT_RADIUS, 6);
      });

      expect(points[0].degrees).toBeCloseTo(CIRCLE_CONFIG.START_ANGLE, 6);

      const expectedGap = 360 / count;
      for (let index = 0; index < count; index += 1) {
        const next = points[(index + 1) % count];
        expect(gapAfter(points[index].degrees, next.degrees)).toBeCloseTo(
          expectedGap,
          6
        );
      }
    }
  );

  it("turns the short way round instead of unwinding the long way", async () => {
    const user = userEvent.setup();
    render(<TimelineBlock segments={makeSegments(6)} />);

    const circle = screen.getByRole("group", { name: "Time periods" });
    const dots = within(circle).getAllByRole("button");
    expect(rotationOf(circle)).toBe(CIRCLE_CONFIG.INITIAL_ROTATION);

    // 0 -> 5 is one step backwards, not five steps forwards.
    await user.click(dots[5]);
    expect(rotationOf(circle)).toBe(CIRCLE_CONFIG.INITIAL_ROTATION + 60);

    // ...and 5 -> 0 comes straight back rather than unwinding 300 degrees.
    await user.click(dots[0]);
    expect(rotationOf(circle)).toBe(CIRCLE_CONFIG.INITIAL_ROTATION);

    // A short hop still goes the direct way.
    await user.click(dots[1]);
    expect(rotationOf(circle)).toBe(CIRCLE_CONFIG.INITIAL_ROTATION - 60);
  });

  it("keeps the point labels upright and in step with the dial", async () => {
    const user = userEvent.setup();
    render(<TimelineBlock segments={makeSegments(6)} />);

    const circle = screen.getByRole("group", { name: "Time periods" });
    const dots = within(circle).getAllByRole("button");

    const assertUpright = () => {
      const dialRotation = rotationOf(circle);
      expect(dialRotation).not.toBeNull();
      dots.forEach((dot) => {
        expect(rotationOf(dot)).toBe(-(dialRotation as number));
      });
    };

    assertUpright();
    await user.click(dots[3]);
    expect(rotationOf(circle)).toBe(CIRCLE_CONFIG.INITIAL_ROTATION - 180);
    assertUpright();

    // Cancelling out only at rest is not enough: if the two transforms run on
    // different clocks the numbers tilt for the length of the turn.
    expect(transformTransitionSeconds(dots[0])).toBe(
      transformTransitionSeconds(circle)
    );
  });
});
