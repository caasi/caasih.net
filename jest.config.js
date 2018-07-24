module.exports = {
  setupFiles: ['./jest.setup.js'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/reusable'
  ],
  moduleNameMapper: {
    '^!raw-loader!(.*)': 'identity-obj-proxy',
    '\\.css$': 'identity-obj-proxy',
    '\\.purs$': 'identity-obj-proxy',
    '^actions(.*)$': '<rootDir>/src/actions$1',
    '^components(.*)$': '<rootDir>/src/components$1',
    '^pages(.*)$': '<rootDir>/src/pages$1',
    '^types(.*)$': '<rootDir>/src/types$1',
    '^reducers(.*)$': '<rootDir>/src/reducers$1'
  }
};
