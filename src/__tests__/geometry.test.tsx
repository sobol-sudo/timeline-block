import React from "react";
import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TimeCircle from "@components/TimeCircle/TimeCircle";
import TimelineBlock from "@components/TimelineBlock/TimelineBlock";
import { CIRCLE_CONFIG } from "@constants";
import { makeSegments } from "./helpers/segments";
import {
  declarationsFor,
  rotationOf,
  transformTransitionSeconds,
} from "./helpers/styles";
import { setViewport } from "./helpers/viewport";

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

  /**
   * The shortest-path rule as a property rather than three hand-picked hops.
   * A walk that wraps in both directions is driven through dials of 5, 6 and
   * 7 points, and two things have to hold after every single selection:
   *
   *   no turn is longer than half a circle — the rule itself, which the
   *   `Math.abs(delta) > segments.length / 2` branch exists to enforce and
   *   which an odd point count puts on a fractional boundary;
   *
   *   the chosen point ends up in the same place on screen every time. The
   *   dial is only useful because the active period always parks at the same
   *   spot, and that fails the moment the rotation is applied with the wrong
   *   sign or short by a segment — a mistake the first rule cannot see,
   *   because a wrong turn can still be a short one.
   */
  it.each([5, 6, 7])(
    "turns a %i-point dial the short way and parks the choice in the same place",
    async (count) => {
      const user = userEvent.setup();
      render(<TimelineBlock segments={makeSegments(count)} />);

      const circle = screen.getByRole("group", { name: "Time periods" });
      const dots = within(circle).getAllByRole("button");
      const segmentAngle = 360 / count;
      const normalise = (degrees: number): number => ((degrees % 360) + 360) % 360;
      const parked = normalise(
        CIRCLE_CONFIG.START_ANGLE + CIRCLE_CONFIG.INITIAL_ROTATION
      );

      // Wraps forward, wraps back, and passes through the halfway tie.
      const walk = [count - 1, 0, 2, count - 2, 1, count - 1, count - 2, 0];
      let previous = rotationOf(circle) as number;
      expect(normalise(CIRCLE_CONFIG.START_ANGLE + previous)).toBeCloseTo(parked, 6);

      for (const index of walk) {
        await user.click(dots[index]);
        const rotation = rotationOf(circle) as number;

        expect(Math.abs(rotation - previous)).toBeLessThanOrEqual(180 + 1e-9);
        expect(
          normalise(CIRCLE_CONFIG.START_ANGLE + index * segmentAngle + rotation)
        ).toBeCloseTo(parked, 6);

        previous = rotation;
      }
    }
  );

  /**
   * The dial is drawn as an absolutely positioned ring inside a fixed square,
   * and the radius it is laid out with drops to `MOBILE_RADIUS` below 992px.
   * Radius and centre are two separate reads of that switch, so they can
   * drift apart and leave the ring hanging off its own box.
   */
  it("keeps the ring centred in its box at both radii", () => {
    const desktop = render(
      <TimeCircle
        segments={makeSegments(6)}
        activeIndex={0}
        onSelect={() => undefined}
      />
    );

    // The square the ring is drawn in is a CSS constant; the radius is a TS
    // one. Nothing enforces the two agreeing except this.
    const box = declarationsFor(
      screen.getByRole("group", { name: "Time periods" })
    );
    expect(box.width).toBe(`${CIRCLE_CONFIG.DEFAULT_RADIUS * 2}px`);
    expect(box.height).toBe(`${CIRCLE_CONFIG.DEFAULT_RADIUS * 2}px`);

    polarPositions(desktop.container).forEach(({ radius }) => {
      expect(radius).toBeCloseTo(CIRCLE_CONFIG.DEFAULT_RADIUS, 6);
    });
    desktop.unmount();

    // Between the tablet and mobile breakpoints the dial is still on screen,
    // drawn at the smaller radius.
    setViewport(900);
    const tablet = render(
      <TimeCircle
        segments={makeSegments(6)}
        activeIndex={0}
        onSelect={() => undefined}
      />
    );

    const points = Array.from(tablet.container.querySelectorAll("button")).map(
      (dot) => {
        const x =
          parseFloat(dot.style.left) +
          CIRCLE_CONFIG.DOT_OFFSET -
          CIRCLE_CONFIG.MOBILE_RADIUS;
        const y =
          parseFloat(dot.style.top) +
          CIRCLE_CONFIG.DOT_OFFSET -
          CIRCLE_CONFIG.MOBILE_RADIUS;
        return {
          radius: Math.hypot(x, y),
          degrees: (Math.atan2(y, x) * 180) / Math.PI,
        };
      }
    );

    expect(points).toHaveLength(6);
    points.forEach(({ radius }) => {
      expect(radius).toBeCloseTo(CIRCLE_CONFIG.MOBILE_RADIUS, 6);
    });
    expect(points[0].degrees).toBeCloseTo(CIRCLE_CONFIG.START_ANGLE, 6);
    for (let index = 0; index < points.length; index += 1) {
      const next = points[(index + 1) % points.length];
      expect(gapAfter(points[index].degrees, next.degrees)).toBeCloseTo(60, 6);
    }
  });
});
