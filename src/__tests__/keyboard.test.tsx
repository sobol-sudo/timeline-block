import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TimelineBlock from "@components/TimelineBlock/TimelineBlock";
import MOCK_DATA from "@data/mock";
import { MOBILE_WIDTH, setViewport } from "./helpers/viewport";

/**
 * The dial and the arrows used to be keyboard traps in the worst way.
 * `disabled` was only ever a styled-components prop, so the attribute never
 * reached the DOM: the dimmed "previous period" arrow stayed in the tab order
 * on a fresh load, Enter fired onSelect(-1), and rendering an undefined
 * segment blanked the entire page. These tests hold that door shut.
 */

const periodName = (): string | null =>
  screen.getByRole("region").getAttribute("aria-label");

const dotFor = (index: number): HTMLElement => {
  const segment = MOCK_DATA[index];
  return screen.getByRole("button", {
    name: `${segment.name}, ${segment.date_1}–${segment.date_2}`,
  });
};

describe("keyboard operation", () => {
  it("activates every dial point with Enter and with Space", async () => {
    const user = userEvent.setup();
    render(<TimelineBlock />);

    for (let index = 0; index < MOCK_DATA.length; index += 1) {
      const dot = dotFor(index);
      dot.focus();
      expect(dot).toHaveFocus();

      await user.keyboard("{Enter}");

      expect(periodName()).toBe(`Key events, ${MOCK_DATA[index].name}`);
      expect(dotFor(index)).toHaveAttribute("aria-current", "true");
    }

    // Space is the other native activation key; a div pretending to be a
    // button answers to neither.
    dotFor(0).focus();
    await user.keyboard(" ");
    expect(periodName()).toBe("Key events, Science");
  });

  it("puts every live control in the tab order and keeps the disabled arrow out of it", async () => {
    const user = userEvent.setup();
    render(<TimelineBlock />);

    expect(screen.getByRole("button", { name: "Previous period" })).toBeDisabled();

    const reached: string[] = [];
    for (let step = 0; step < 20; step += 1) {
      await user.tab();
      const focused = document.activeElement;
      if (!focused || focused === document.body) break;
      const label = focused.getAttribute("aria-label") ?? focused.textContent ?? "";
      if (reached.includes(label)) break;
      reached.push(label);
    }

    expect(reached).toEqual([
      "Science, 2002–2007",
      "Literature, 2008–2013",
      "History, 2014–2019",
      "Mathematics, 2020–2025",
      "Sport, 2026–2031",
      "Cinema, 2032–2037",
      "Next period",
    ]);
    // The exact regression: tabbing onto the dimmed arrow and pressing Enter.
    expect(reached).not.toContain("Previous period");
  });

  it("steps through periods with Enter on the arrows and disables each end", async () => {
    const user = userEvent.setup();
    render(<TimelineBlock />);

    const next = screen.getByRole("button", { name: "Next period" });
    next.focus();
    await user.keyboard("{Enter}");
    expect(periodName()).toBe("Key events, Literature");

    const previous = screen.getByRole("button", { name: "Previous period" });
    expect(previous).toBeEnabled();
    previous.focus();
    await user.keyboard("{Enter}");
    expect(periodName()).toBe("Key events, Science");
    expect(screen.getByRole("button", { name: "Previous period" })).toBeDisabled();

    for (let step = 0; step < MOCK_DATA.length - 1; step += 1) {
      screen.getByRole("button", { name: "Next period" }).focus();
      await user.keyboard("{Enter}");
    }
    expect(periodName()).toBe("Key events, Cinema");
    expect(screen.getByRole("button", { name: "Next period" })).toBeDisabled();
  });

  it("keeps rendering when the period list shrinks under a high selection", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<TimelineBlock segments={MOCK_DATA} />);

    await user.click(dotFor(MOCK_DATA.length - 1));
    expect(periodName()).toBe("Key events, Cinema");

    // The stored index is now past the end of the new list.
    rerender(<TimelineBlock segments={MOCK_DATA.slice(0, 2)} />);

    expect(periodName()).toBe("Key events, Literature");
    expect(screen.getByRole("button", { name: "Next period" })).toBeDisabled();
  });

  it("offers no controls at all when there are no periods", () => {
    render(<TimelineBlock segments={[]} />);

    expect(screen.getByRole("status")).toHaveTextContent("No periods to show.");
    expect(screen.getByRole("heading", { name: /Historical/ })).toBeInTheDocument();
    // A "next period" arrow with nothing to move to is a control that lies.
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("activates the mobile pagination dots from the keyboard", async () => {
    setViewport(MOBILE_WIDTH);
    const user = userEvent.setup();
    render(<TimelineBlock />);

    const dot = screen.getByRole("button", { name: "Go to Sport" });
    dot.focus();
    expect(dot).toHaveFocus();

    await user.keyboard("{Enter}");

    expect(periodName()).toBe("Key events, Sport");
    expect(screen.getByRole("button", { name: "Go to Sport" })).toHaveAttribute(
      "aria-current",
      "true"
    );
    expect(screen.getByRole("button", { name: "Go to Science" })).not.toHaveAttribute(
      "aria-current"
    );
  });
});
