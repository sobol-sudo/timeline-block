/**
 * Reads the declarations styled-components actually emitted for an element.
 *
 * `getComputedStyle` in jsdom does not resolve class rules from injected
 * stylesheets, and the dial's rotation only ever exists as a generated class,
 * so the sheet is parsed directly. Only unconditional rules are considered:
 * media-query blocks are skipped, since jsdom has no viewport to match them
 * against and reporting them would be a lie.
 */

interface Rule {
  selector: string;
  body: string;
}

const collectCss = (): string =>
  Array.from(document.querySelectorAll("style"))
    .map((tag) => {
      const text = tag.textContent ?? "";
      if (text.trim().length > 0) return text;
      const sheet = tag.sheet;
      if (!sheet) return "";
      return Array.from(sheet.cssRules)
        .map((rule) => rule.cssText)
        .join("\n");
    })
    .join("\n");

const unconditionalRules = (css: string): Rule[] => {
  const rules: Rule[] = [];
  let index = 0;
  let preludeStart = 0;

  while (index < css.length) {
    if (css[index] !== "{") {
      index += 1;
      continue;
    }

    const prelude = css.slice(preludeStart, index).trim();
    let depth = 1;
    let cursor = index + 1;
    while (cursor < css.length && depth > 0) {
      if (css[cursor] === "{") depth += 1;
      else if (css[cursor] === "}") depth -= 1;
      cursor += 1;
    }
    const body = css.slice(index + 1, cursor - 1);

    if (!prelude.startsWith("@")) {
      rules.push({ selector: prelude, body });
    }

    index = cursor;
    preludeStart = cursor;
  }

  return rules;
};

/** Merged declarations for the element's own classes, in source order. */
export const declarationsFor = (element: Element): Record<string, string> => {
  const classes = Array.from(element.classList).map((name) => `.${name}`);
  const merged: Record<string, string> = {};

  unconditionalRules(collectCss()).forEach(({ selector, body }) => {
    const matches = selector
      .split(",")
      .map((part) => part.trim())
      .some((part) => classes.includes(part));
    if (!matches) return;

    body.split(";").forEach((declaration) => {
      const separator = declaration.indexOf(":");
      if (separator === -1) return;
      const property = declaration.slice(0, separator).trim();
      const value = declaration.slice(separator + 1).trim();
      if (property.length === 0 || value.length === 0) return;
      merged[property] = value;
    });
  });

  return merged;
};

/** Degrees inside a `rotate(Ndeg)` transform, or null when absent. */
export const rotationOf = (element: Element): number | null => {
  const transform = declarationsFor(element).transform;
  if (!transform) return null;
  const match = /rotate\(\s*(-?[\d.]+)deg\s*\)/.exec(transform);
  return match ? Number(match[1]) : null;
};

/** Duration, in seconds, of the `transform` entry in a transition shorthand. */
export const transformTransitionSeconds = (element: Element): number | null => {
  const transition = declarationsFor(element).transition;
  if (!transition) return null;
  const entry = transition
    .split(",")
    .map((part) => part.trim())
    .find((part) => part.startsWith("transform"));
  if (!entry) return null;
  const match = /([\d.]+)m?s/.exec(entry);
  if (!match) return null;
  return entry.includes("ms") ? Number(match[1]) / 1000 : Number(match[1]);
};
