/** @type {import('@swc/core').Config} */
const swcCongfig = {
  jsc: {
    parser: { syntax: 'typescript' },
    target: 'esnext',
  },
  sourceMaps: 'inline',
};

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  transform: { '^.+\\.[cm]?[jt]sx?$': [ '@swc/jest', swcCongfig ] },
  transformIgnorePatterns: [ '/node_modules/(?!@faker-js/faker/)' ],
  moduleNameMapper: { '^(\\.{1,2}/.*)\\.(js|mjs|cjs)$': '$1' },
  setupFiles: [ '<rootDir>/jest.env.ts' ],
  collectCoverage: true,
  clearMocks: true,
};

export default config;
