"use strict";

const { defineConfig } = require("eslint/config");
const eslintJs = require("@eslint/js");
const jestPluging = require("eslint-plugin-jest");
const auraConfig = require("@salesforce/eslint-plugin-aura");
const lwcConfig = require("@salesforce/eslint-config-lwc/recommended");
const globals = require("globals");

module.exports = defineConfig([
  {
    ignores: ["force-app/main/src-components/staticresources/**", "coverage/**"]
  },
  {
    files: ["force-app/main/default/aura/**/*.js"],
    extends: [...auraConfig.configs.recommended, ...auraConfig.configs.locker]
  },
  {
    files: [
      "force-app/main/default/lwc/**/*.js",
      "force-app/main/src-components/lwc/**/*.js",
      "force-app/main/src-components-with-apex/lwc/**/*.js",
      "force-app-examples/main/default/lwc/**/*.js"
    ],
    extends: [lwcConfig]
  },
  {
    files: [
      "**/datatablePlusDynamicCell/*.js",
      "**/datatablePlusDynamicCellEdit/*.js",
      "**/lookupSubtitle/*.js",
      "**/componentReferenceOverview/*.js",
      "**/datatablePlusExtendedTypes/*.js"
    ],
    rules: {
      "@lwc/lwc-platform/no-dynamic-import-identifier": "off"
    }
  },
  {
    files: ["**/lookup/*.js"],
    rules: {
      "@lwc/lwc/no-async-operation": "off"
    }
  },
  {
    files: ["**/lwc/**/*.test.js"],
    extends: [lwcConfig],
    rules: {
      "@lwc/lwc/no-unexpected-wire-adapter-usages": "off",
      "@lwc/lwc/no-inner-html": "off"
    },
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  },
  {
    files: ["jest.config.js", "test/setupFiles/setEnvVars.js"],
    rules: {
      "@lwc/lwc-platform/no-process-env": "off"
    }
  },
  {
    files: ["force-app/test/jest-mocks/**/*.js"],
    languageOptions: {
      sourceType: "module",
      ecmaVersion: "latest",
      globals: {
        ...globals.node,
        ...globals.es2021,
        ...jestPluging.environments.globals.globals
      }
    },
    plugins: {
      eslintJs
    },
    extends: ["eslintJs/recommended"]
  }
]);
