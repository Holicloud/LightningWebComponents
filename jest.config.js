const { jestConfig } = require("@salesforce/sfdx-lwc-jest/config");

const defaultJestTimeoutInSeconds = 120;
const testTimeoutInSeconds =
  Number(process.env.JEST_TIMEOUT) || defaultJestTimeoutInSeconds;

const setupFilesAfterEnv = jestConfig.setupFilesAfterEnv || [];
setupFilesAfterEnv.push("<rootDir>/test/setupFiles/jest-sa11y-setup.js");

module.exports = {
  ...jestConfig,
  testTimeout: testTimeoutInSeconds * 1000,
  setupFiles: ["<rootDir>/test/setupFiles/setEnvVars.js", "jest-canvas-mock"],
  collectCoverageFrom: [
    "force-app/main/default/lwc/**/*.js",
    "force-app/main/src-components-with-apex/lwc/**/*.js",
    "force-app/main/src-components/lwc/**/*.js",
    "force-app/main/src-utils/lwc/**/*.js",
    "force-app/main/form-builder/lwc/**/*.js",
    "!**/__tests__/**",
    "!**/node_modules/**"
  ],
  moduleNameMapper: {
    "^test/utils$": "<rootDir>/force-app/test/jest/utils",
    "^lightning/navigation$":
      "<rootDir>/force-app/test/jest/jest-mocks/lightning-mocks/navigation",
    "^lightning/modal$":
      "<rootDir>/force-app/test/jest/jest-mocks/lightning-mocks/modal",
    "^lightning/platformShowToastEvent$":
      "<rootDir>/force-app/test/jest/jest-mocks/lightning-mocks/platformShowToastEvent"
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/force-app-examples/",
    "<rootDir>/force-app-examples/main/examples-with-apex/lwc/apexLookupBasic/"
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/force-app-examples/",
    "<rootDir>/force-app-examples/main/examples-with-apex/lwc/apexLookupBasic/"
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
    },
    "./force-app/main/form-builder/lwc/**/*.js": {
      statements: 75,
      lines: 75
    }
  },
  testMatch: ["**/__tests__/**/*.test.js"],
  setupFilesAfterEnv
};
