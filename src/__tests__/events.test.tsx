import React from "react";
import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TimelineBlock from "@components/TimelineBlock/TimelineBlock";
import { TimelineSegment } from "@types";

/**
 * The event slider is the one part of the block nothing else in this suite
 * touches, and it is the only part whose controls are not ours: Swiper draws
 * them, and everything that makes them operable by anything other than a
 * mouse comes from the `A11y` module listed in `TimeSlider`. Dropping that
 * one word from the module list costs nothing visible — the arrows still sit
 * there and still work under a mouse — and silently removes event navigation
 * for every keyboard and screen-reader user. Nothing else here would notice.
 *
 * jsdom lays nothing out, so every element measures zero and Swiper decides
 * the slides already fit and locks its arrows. That is a jsdom artefact, not
 * the product, so these tests pin the wiring rather than the movement; that
 * the track really translates was checked in a browser.
 */

const withEvents = (count: number): TimelineSegment[] => [
  {
    name: "Science",
    date_1: "2002",
    date_2: "2007",
    sliderData: Array.from({ length: count }, (_, index) => ({
      date: 2002 + index,
      text: `Event ${index + 1}`,
    })),
  },
  {
    name: "Silence",
    date_1: "2008",
    date_2: "2013",
    sliderData: [],
  },
];

describe("the events panel", () => {
  it("exposes its own navigation and its slides to assistive technology", () => {
    render(<TimelineBlock segments={withEvents(4)} />);

    const panel = screen.getByRole("region", { name: "Key events, Science" });

    // Named controls, not two anonymous divs.
    const previous = within(panel).getByRole("button", {
      name: "Previous events",
    });
    const next = within(panel).getByRole("button", { name: "Next events" });

    // Both have to point at the thing they scroll, and it has to be the track
    // in this panel — the ids Swiper mints are per-instance for that reason.
    [previous, next].forEach((arrow) => {
      const controls = arrow.getAttribute("aria-controls");
      expect(controls).toBeTruthy();
      const track = document.getElementById(controls as string);
      expect(track).not.toBeNull();
      expect(panel.contains(track)).toBe(true);
      // Sliding to an event that was off screen is announced, not silent.
      expect(track).toHaveAttribute("aria-live", "polite");
    });

    // Each event says where it sits in the run, so "next" has a meaning to
    // somebody who cannot see the track move.
    expect(
      within(panel)
        .getAllByRole("group")
        .map((slide) => slide.getAttribute("aria-label"))
    ).toEqual(["1 / 4", "2 / 4", "3 / 4", "4 / 4"]);
  });

  it("says a period has no events instead of leaving an empty strip and dead arrows", async () => {
    const user = userEvent.setup();
    const segments = withEvents(4);
    const { container } = render(<TimelineBlock segments={segments} />);

    screen
      .getByRole("button", { name: "Silence, 2008–2013" })
      .focus();
    await user.keyboard("{Enter}");

    const panel = screen.getByRole("region", { name: "Key events, Silence" });
    expect(panel).toHaveTextContent("No events recorded for this period.");

    // The arrows used to survive into a period with nothing to page through,
    // which is a control that lies about having somewhere to go.
    expect(
      screen.queryByRole("button", { name: "Previous events" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Next events" })
    ).not.toBeInTheDocument();
    expect(container.querySelector(".swiper")).toBeNull();

    // And the announcement counts what is actually there.
    expect(
      screen.getByText("Silence, 2008 to 2013. 0 events.")
    ).toBeInTheDocument();

    // Still a working block: the period with events is one press away.
    screen.getByRole("button", { name: "Science, 2002–2007" }).focus();
    await user.keyboard("{Enter}");
    expect(
      screen.getByRole("region", { name: "Key events, Science" })
    ).toBeInTheDocument();
  });
});
