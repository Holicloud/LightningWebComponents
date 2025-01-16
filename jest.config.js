const { jestConfig } = require('@salesforce/sfdx-lwc-jest/config');

const defaultJestTimeoutInSeconds = 120;
const testTimeoutInSeconds = Number(process.env.JEST_TIMEOUT) || defaultJestTimeoutInSeconds;

const setupFilesAfterEnv = jestConfig.setupFilesAfterEnv || [];
setupFilesAfterEnv.push('<rootDir>/test/setupFiles/jest-sa11y-setup.js');

module.exports = {
  ...jestConfig,
  testTimeout: testTimeoutInSeconds * 1000,
    setupFiles: ['<rootDir>/test/setupFiles/setEnvVars.js'],
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
  setupFiles: ['jest-canvas-mock'],
  setupFilesAfterEnv
};