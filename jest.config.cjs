// CommonJS on purpose: package.json declares "type": "module", so a plain
// jest.config.js would be loaded as ESM and Jest cannot read it.
const babelOptions = {
  // Ignore .babelrc here. That file is scoped to this package and never
  // reaches node_modules, but Swiper ships ESM only and has to be transpiled
  // too, so the presets are declared inline instead.
  configFile: false,
  babelrc: false,
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    "@babel/preset-react",
    "@babel/preset-typescript",
  ],
};

module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.cjs"],
  testMatch: ["<rootDir>/src/**/__tests__/**/*.test.tsx"],
  transform: {
    "^.+\\.[cm]?[jt]sx?$": ["babel-jest", babelOptions],
  },
  // Swiper (and its ssr-window/dom7 helpers) publish untranspiled ESM.
  transformIgnorePatterns: ["node_modules/(?!(swiper|ssr-window|dom7)/)"],
  moduleNameMapper: {
    // Stylesheets carry no behaviour worth asserting on in jsdom.
    "^swiper/css.*$": "<rootDir>/src/__tests__/helpers/styleStub.cjs",
    "\\.css$": "<rootDir>/src/__tests__/helpers/styleStub.cjs",
    // Mirrors the webpack aliases so the components can be imported as-is.
    "^@components/(.*)$": "<rootDir>/src/components/$1",
    "^@hooks/(.*)$": "<rootDir>/src/hooks/$1",
    "^@data/(.*)$": "<rootDir>/src/data/$1",
    "^@styles/(.*)$": "<rootDir>/src/styles/$1",
    "^@constants$": "<rootDir>/src/constants/index.ts",
    "^@constants/(.*)$": "<rootDir>/src/constants/$1",
    "^@types$": "<rootDir>/src/types/index.ts",
  },
};
