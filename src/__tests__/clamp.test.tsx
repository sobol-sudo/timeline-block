import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TimelineBlock from "@components/TimelineBlock/TimelineBlock";
import MOCK_DATA from "@data/mock";

/**
 * Second line of defence behind the disabled attribute.
 *
 * The original crash was a control asking for index -1 and the block handing
 * `segments[-1]` to the tree. The arrows carry a real `disabled` now, and
 * React will not even dispatch a click to an element its own props call
 * disabled, so that particular route is shut twice over. The clamp still has
 * to hold on its own: it is what stops the next control anybody adds from
 * emptying the page.
 *
 * The dial is replaced here by a probe that asks for indexes no real control
 * offers. Everything else in the block is the real thing.
 */
jest.mock("@components/TimeCircle/TimeCircle", () => ({
  __esModule: true,
  default: ({ onSelect }: { onSelect: (index: number) => void }) => (
    <div>
      <button type="button" onClick={() => onSelect(-1)}>
        request -1
      </button>
      <button type="button" onClick={() => onSelect(99)}>
        request 99
      </button>
    </div>
  ),
}));

const periodName = (): string | null =>
  screen.getByRole("region").getAttribute("aria-label");

describe("out-of-range selections", () => {
  it("clamps whatever index a control asks for instead of emptying the block", async () => {
    const user = userEvent.setup();
    render(<TimelineBlock />);

    expect(periodName()).toBe("Key events, Science");

    await user.click(screen.getByRole("button", { name: "request -1" }));
    expect(periodName()).toBe("Key events, Science");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "request 99" }));
    expect(periodName()).toBe(
      `Key events, ${MOCK_DATA[MOCK_DATA.length - 1].name}`
    );
    expect(screen.getByRole("heading", { name: /Historical/ })).toBeInTheDocument();
  });
});
