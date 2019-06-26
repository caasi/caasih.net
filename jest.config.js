const { defaults } = require('jest-config')

module.exports = {
  setupFiles: ['./jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/reusable'],
  moduleNameMapper: {
    '^!raw-loader!(.*)': 'identity-obj-proxy',
    '\\.css$': 'identity-obj-proxy',
    '\\.purs$': 'identity-obj-proxy',
    '\\.mdx$': 'identity-obj-proxy',
    '^components(.*)$': '<rootDir>/src/components$1',
    '^pages(.*)$': '<rootDir>/src/pages$1',
    '^types(.*)$': '<rootDir>/src/types$1',
    '^data(.*)$': '<rootDir>/src/data$1',
  },
  coverageDirectory: './coverage/',
  collectCoverage: true,
}
