require("@testing-library/jest-dom");

const { resetViewport } = require("./src/__tests__/helpers/viewport.ts");

// jsdom implements neither of these, and both are read during render:
// matchMedia by useMediaQuery, ResizeObserver by Swiper.
if (typeof window.ResizeObserver === "undefined") {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

beforeEach(() => {
  resetViewport();
});

afterEach(() => {
  resetViewport();
});
