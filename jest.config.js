const { jestConfig } = require("@salesforce/sfdx-lwc-jest/config");

const defaultJestTimeoutInSeconds = 120;
const testTimeoutInSeconds =
  Number(process.env.JEST_TIMEOUT) || defaultJestTimeoutInSeconds;

const setupFilesAfterEnv = jestConfig.setupFilesAfterEnv || [];
setupFilesAfterEnv.push("<rootDir>/test/setupFiles/jest-sa11y-setup.js");

module.exports = {
  ...jestConfig,
  testTimeout: testTimeoutInSeconds * 1000,
  setupFiles: ["<rootDir>/test/setupFiles/setEnvVars.js"],
  moduleNameMapper: {
    "^test/utils$": "<rootDir>/force-app/test/jest/utils",
    "^lightning/navigation$":
      "<rootDir>/force-app/test/jest/jest-mocks/lightning-mocks/navigation"
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/force-app-examples/",
    "<rootDir>/force-app/main/default/lwc/componentReference/componentReference"
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/force-app-examples/",
    "<rootDir>/force-app/main/default/lwc/componentReference/componentReference"
  ],
  coverageThreshold: {
    global: {
      statements: 75,
      lines: 75
    },
    "./force-app/main/default/lwc/**/*.js": {
      statements: 75,
      lines: 75
    },
    "./force-app/main/src-components-with-apex/lwc/**/*.js": {
      statements: 75,
      lines: 75
    },
    "./force-app/main/src-components/lwc/**/*.js": {
      statements: 75,
      lines: 75
    },
    "./force-app/main/src-utils/lwc/**/*.js": {
      statements: 75,
      lines: 75
    }
  },
  setupFiles: ["jest-canvas-mock"],
  testMatch: ["**/__tests__/**/*.test.js"],
  setupFilesAfterEnv
};
