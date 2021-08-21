const { defaults } = require('jest-config')

const swcOptions = {
  jsc: {
    parser: {
      syntax: "ecmascript",
      jsx: true,
      exportDefaultFrom: true
    },
  },
  module: {
    type: "commonjs",
  },
};

module.exports = {
  setupFiles: ['./jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/reusable'],
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest', swcOptions],
  },
  moduleNameMapper: {
    '^!raw-loader!(.*)': 'identity-obj-proxy',
    '\\.css$': 'identity-obj-proxy',
    '\\.purs$': 'identity-obj-proxy',
    '\\.bs$': 'identity-obj-proxy',
    '\\.mdx$': 'identity-obj-proxy',
    '^components(.*)$': '<rootDir>/src/components$1',
    '^pages(.*)$': '<rootDir>/src/pages$1',
    '^types(.*)$': '<rootDir>/src/types$1',
    '^data(.*)$': '<rootDir>/src/data$1',
  },
  coverageDirectory: './coverage/',
  collectCoverage: true,
}
