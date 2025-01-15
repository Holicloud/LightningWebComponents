const { jestConfig } = require("@salesforce/sfdx-lwc-jest/config");

module.exports = {
  ...jestConfig,
  moduleNameMapper: {
    "^lightning/navigation$": "<rootDir>/testUtils/mocks/lightning/navigation",
    "^test/utils$": "<rootDir>/force-app/test/jest/utils"
  },
  coverageThreshold: {
    global: {
      statements: 75,
      lines: 75
    },
    './force-app/main/default/lwc/**/*.js': {
      statements: 75,
      lines: 75
    }
  },
  // automock: true,
};