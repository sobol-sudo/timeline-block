import React from "react";
import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TimelineBlock from "@components/TimelineBlock/TimelineBlock";
import { rotationOf } from "./helpers/styles";

/**
 * The README promises the block can be dropped onto a page more than once.
 * That promise breaks the moment anything about it is global: a literal DOM
 * id would make one block's arrows point at the other block's slider, and
 * state kept outside the component would move both dials at once.
 */

const renderTwo = () => {
  render(
    <>
      <div data-testid="first">
        <TimelineBlock />
      </div>
      <div data-testid="second">
        <TimelineBlock />
      </div>
    </>
  );

  return {
    first: screen.getByTestId("first"),
    second: screen.getByTestId("second"),
  };
};

describe("two blocks on one page", () => {
  it("gives each block its own panel and points its controls only at that panel", () => {
    const { first, second } = renderTwo();

    const firstPanel = within(first).getByRole("region");
    const secondPanel = within(second).getByRole("region");

    expect(firstPanel.id).not.toHaveLength(0);
    expect(secondPanel.id).not.toHaveLength(0);
    expect(firstPanel.id).not.toBe(secondPanel.id);

    [first, second].forEach((block) => {
      const controls = Array.from(block.querySelectorAll("[aria-controls]"));
      expect(controls.length).toBeGreaterThan(0);

      controls.forEach((control) => {
        const targetId = control.getAttribute("aria-controls") as string;
        const target = document.getElementById(targetId);
        expect(target).not.toBeNull();
        // Resolving is not enough; it has to resolve inside its own block.
        expect(block.contains(target)).toBe(true);
      });
    });

    const ids = Array.from(document.querySelectorAll("[id]")).map(
      (element) => element.id
    );
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("leaves the other block untouched when a period is chosen", async () => {
    const user = userEvent.setup();
    const { first, second } = renderTwo();

    await user.click(
      within(first).getByRole("button", { name: "History, 2014–2019" })
    );

    expect(within(first).getByRole("region")).toHaveAccessibleName(
      "Key events, History"
    );
    expect(within(second).getByRole("region")).toHaveAccessibleName(
      "Key events, Science"
    );

    expect(
      within(first).getByRole("button", { name: "Previous period" })
    ).toBeEnabled();
    expect(
      within(second).getByRole("button", { name: "Previous period" })
    ).toBeDisabled();

    // The dials have to disagree too, not just the panels.
    expect(
      rotationOf(within(first).getByRole("group", { name: "Time periods" }))
    ).toBe(-75);
    expect(
      rotationOf(within(second).getByRole("group", { name: "Time periods" }))
    ).toBe(45);
  });
});
