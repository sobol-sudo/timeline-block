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

const dialName = (index: number): string => {
  const segment = MOCK_DATA[index];
  return `${segment.name}, ${segment.date_1}–${segment.date_2}`;
};

const mobileDotName = (index: number): string => `Go to ${MOCK_DATA[index].name}`;

const dotFor = (index: number): HTMLElement =>
  screen.getByRole("button", { name: dialName(index) });

type User = ReturnType<typeof userEvent.setup>;

const COUNTER = /^Period (\d+) of (\d+)$/;

/** The period the block itself says it is on, read off its own counter. */
const currentIndex = (): number => {
  const text = screen.getByText(COUNTER).textContent ?? "";
  return Number((COUNTER.exec(text) as RegExpExecArray)[1]) - 1;
};

/** Accessible names of everything Tab can reach, in tab order. */
const tabThrough = async (user: User): Promise<string[]> => {
  const reached: string[] = [];
  for (let step = 0; step < 40; step += 1) {
    await user.tab();
    const focused = document.activeElement;
    if (!focused || focused === document.body) break;
    const label = focused.getAttribute("aria-label") ?? focused.textContent ?? "";
    if (reached.includes(label)) break;
    reached.push(label);
  }
  return reached;
};

/**
 * Where a control is required to lead, worked out from the name it announces.
 * An unrecognised name throws rather than being skipped: a control with no
 * declared destination is exactly what the sweep below exists to catch.
 */
const destinationOf = (label: string, from: number): number => {
  const named = MOCK_DATA.findIndex(
    (_, index) => label === dialName(index) || label === mobileDotName(index)
  );
  if (named !== -1) return named;

  if (label === "Previous period") {
    // Being reachable at all means it must have somewhere to go. This is the
    // original bug in one line: the dimmed arrow sat in the tab order at
    // index 0, and Enter on it asked for segment -1.
    expect(from).toBeGreaterThan(0);
    return from - 1;
  }
  if (label === "Next period") {
    expect(from).toBeLessThan(MOCK_DATA.length - 1);
    return from + 1;
  }

  throw new Error(`no destination is declared for the control "${label}"`);
};

/**
 * Walks the tab order from a given period, then presses Enter and Space on
 * every control it found — each on a freshly mounted block, so the controls
 * are exercised independently rather than as one long chain. Every press has
 * to leave the block standing and land on the period the control's own name
 * promises. Returns the tab order so callers can assert what was in it.
 */
const sweepFrom = async (
  user: User,
  from: number,
  seedName: (index: number) => string
): Promise<string[]> => {
  const seed = async (): Promise<void> => {
    if (from === 0) return;
    await user.click(screen.getByRole("button", { name: seedName(from) }));
    // Clicking left focus on the seed control; the walk has to start from the
    // top of the document or it would miss everything before it.
    (document.activeElement as HTMLElement | null)?.blur();
  };

  const opening = render(<TimelineBlock />);
  await seed();
  const reached = await tabThrough(user);
  opening.unmount();

  expect(reached.length).toBeGreaterThan(0);

  // Enter and Space are the two keys a native button answers to. A div
  // wearing role="button" answers to neither.
  for (const key of ["{Enter}", " "]) {
    for (const label of reached) {
      const view = render(<TimelineBlock />);
      await seed();
      expect(currentIndex()).toBe(from);

      const destination = destinationOf(label, from);
      screen.getByRole("button", { name: label }).focus();
      await user.keyboard(key);

      // The block is still standing...
      expect(
        screen.getByRole("heading", { name: /Historical/ })
      ).toBeInTheDocument();
      // ...and the press landed where the control's name said it would.
      expect(periodName()).toBe(`Key events, ${MOCK_DATA[destination].name}`);
      expect(currentIndex()).toBe(destination);

      view.unmount();
    }
  }

  return reached;
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

  /**
   * Reaching an end of the range disables the arrow that got you there. A
   * browser unfocuses an element the moment it becomes disabled — checked in
   * Chrome: `document.activeElement` falls back to `<body>` — so the arrow
   * that worked five times in a row used to eject the keyboard user out of
   * the block on the sixth press, and the next Tab restarted from the top of
   * the page. jsdom does not implement that unfocusing step, so these assert
   * the fix rather than the symptom: focus has to be sitting on the arrow
   * that is still live.
   */
  it("hands focus to the live arrow when the pressed one disables itself", async () => {
    const user = userEvent.setup();
    render(<TimelineBlock />);

    for (let step = 0; step < MOCK_DATA.length - 1; step += 1) {
      screen.getByRole("button", { name: "Next period" }).focus();
      await user.keyboard("{Enter}");
    }

    expect(screen.getByRole("button", { name: "Next period" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous period" })).toHaveFocus();

    for (let step = 0; step < MOCK_DATA.length - 1; step += 1) {
      screen.getByRole("button", { name: "Previous period" }).focus();
      await user.keyboard("{Enter}");
    }

    expect(screen.getByRole("button", { name: "Previous period" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next period" })).toHaveFocus();
  });

  it("leaves focus alone when a period is chosen from somewhere else", async () => {
    const user = userEvent.setup();
    render(<TimelineBlock />);

    // Selecting the last period from the dial also disables the next arrow,
    // but the arrow was not what the user pressed, so the handoff must not
    // fire and drag focus off the point they are standing on.
    const last = dotFor(MOCK_DATA.length - 1);
    last.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("button", { name: "Next period" })).toBeDisabled();
    expect(dotFor(MOCK_DATA.length - 1)).toHaveFocus();
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

  /**
   * The sweep. Everything above pins one control at a time; this walks the
   * whole tab order and holds every control it finds to the destination its
   * own accessible name promises, with Enter and with Space, from both ends
   * of the range. Three failures it is meant to catch, in order of how badly
   * they hurt: a control that lands on a period that does not exist and takes
   * the page down with it; a control that is reachable but leads nowhere
   * (the dimmed arrow in the tab order — the original bug); and a control
   * wired to the wrong period. Because it enumerates the tab order rather
   * than a fixed list, a new control added without a destination fails it.
   */
  it("takes every keyboard-reachable control exactly where its name promises", async () => {
    const user = userEvent.setup();

    const fromFirst = await sweepFrom(user, 0, dialName);
    expect(fromFirst).toContain("Next period");
    expect(fromFirst).not.toContain("Previous period");

    const fromLast = await sweepFrom(user, MOCK_DATA.length - 1, dialName);
    expect(fromLast).toContain("Previous period");
    expect(fromLast).not.toContain("Next period");
  }, 30000);

  /**
   * The same sweep over the mobile controls, which are a different component.
   * jsdom applies no media queries, so the dial points are still in the tab
   * order here where a browser would have hidden them; they are real buttons
   * either way and holding them to their destinations costs nothing.
   */
  it("takes every mobile control exactly where its name promises", async () => {
    setViewport(MOBILE_WIDTH);
    const user = userEvent.setup();

    const reached = await sweepFrom(user, 0, mobileDotName);

    MOCK_DATA.forEach((_, index) => {
      expect(reached).toContain(mobileDotName(index));
    });
  }, 30000);
});
