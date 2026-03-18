# Configuration Reference

## package.json

### NPM Scripts

| Script               | Command                             | Purpose                  |
| -------------------- | ----------------------------------- | ------------------------ |
| `lint`               | `eslint . --fix`                    | Lint & auto-fix          |
| `lint:verify`        | `eslint .`                          | Lint check only (CI)     |
| `analyzer`           | `sf code-analyzer run`              | Salesforce Code Analyzer |
| `test`               | `npm run test:unit`                 | Run unit tests           |
| `test:unit`          | `sfdx-lwc-jest`                     | Run LWC Jest tests       |
| `test:unit:watch`    | `sfdx-lwc-jest --watch`             | Watch mode               |
| `test:unit:debug`    | `sfdx-lwc-jest --debug`             | Debug mode               |
| `test:unit:coverage` | `sfdx-lwc-jest --coverage`          | With coverage            |
| `prettier`           | `prettier --write "**/*.{cls,...}"` | Format all files         |
| `prettier:verify`    | `prettier --check "**/*.{cls,...}"` | Format check (CI)        |
| `prepare`            | `husky \|\| true`                   | Install Git hooks        |
| `precommit`          | `lint-staged`                       | Pre-commit hook runner   |

### Dev Dependencies

| Package                                                                   | Purpose                                                      |
| ------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `@babel/core`, `@babel/eslint-parser`, `@babel/parser`, `@babel/traverse` | Babel tooling for AST parsing (used by validate/fix scripts) |
| `@locker/eslint-config-locker`                                            | Locker Service ESLint rules                                  |
| `@lwc/eslint-plugin-lwc`                                                  | LWC-specific ESLint plugin                                   |
| `@prettier/plugin-xml`                                                    | XML formatting support                                       |
| `@sa11y/jest`                                                             | Accessibility testing                                        |
| `@salesforce/eslint-config-lwc`                                           | Salesforce LWC ESLint config                                 |
| `@salesforce/eslint-plugin-aura`                                          | Aura component ESLint                                        |
| `@salesforce/eslint-plugin-lightning`                                     | Lightning ESLint                                             |
| `@salesforce/sfdx-lwc-jest`                                               | LWC Jest adapter                                             |
| `eslint`                                                                  | Core linter                                                  |
| `eslint-plugin-import`                                                    | Import/export rules                                          |
| `eslint-plugin-jest`                                                      | Jest-specific rules                                          |
| `husky`                                                                   | Git hooks                                                    |
| `jest-canvas-mock`                                                        | Canvas API mock                                              |
| `lint-staged`                                                             | Run linters on staged files                                  |
| `prettier`                                                                | Code formatter                                               |
| `prettier-plugin-apex`                                                    | Apex formatting                                              |
| `recast`                                                                  | AST printer (used by fix-lwc.js)                             |

### lint-staged Configuration

```json
{
  "**/*.{cls,cmp,component,css,html,js,json,md,page,trigger,xml,yaml,yml}": [
    "prettier --write"
  ],
  "**/*": ["eslint . --fix"],
  "**/lwc/**/*.js": ["node validate-lwc.js"],
  "force-app-examples/**/lwc/**/*.js": ["eslint . --fix"]
}
```

---

## ESLint Configuration (`eslint.config.js`)

Uses flat config format (`defineConfig`).

### Rule Groups

| Files                           | Config                                                         |
| ------------------------------- | -------------------------------------------------------------- |
| `aura/**/*.js`                  | `@salesforce/eslint-plugin-aura` recommended + locker          |
| `lwc/**/*.js` (all source dirs) | `@salesforce/eslint-config-lwc/recommended`                    |
| Dynamic import components       | `no-dynamic-import-identifier: off`                            |
| `lookup/*.js`                   | `no-async-operation: off`                                      |
| `lwc/**/*.test.js`              | `no-unexpected-wire-adapter-usages: off`, `no-inner-html: off` |
| Config/setup files              | `no-process-env: off`                                          |

### Ignored Paths

- `force-app/main/src-components/staticresources/**`
- `coverage/**`

---

## Prettier Configuration (`.prettierrc`)

```json
{
  "trailingComma": "none",
  "plugins": ["prettier-plugin-apex", "@prettier/plugin-xml"],
  "overrides": [
    { "files": "**/lwc/**/*.html", "options": { "parser": "lwc" } },
    { "files": "*.{cmp,page,component}", "options": { "parser": "html" } }
  ]
}
```

---

## Jest Configuration (`jest.config.js`)

- **Timeout:** 120s (env `JEST_TIMEOUT`)
- **Setup files:** `setEnvVars.js`, `jest-canvas-mock`, `jest-sa11y-setup.js`
- **Module maps:** `test/utils`, `lightning/navigation`, `lightning/modal`, `lightning/platformShowToastEvent`
- **Coverage:** 75% threshold for statements and lines per source directory
- **Test match:** `**/__tests__/**/*.test.js`

---

## Salesforce Code Analyzer (`code-analyzer.yml`)

- All engines enabled: `retire-js`, `regex`, `eslint`, `pmd`, `cpd`, `sfge`, `flow`
- Default configuration with no custom rule overrides
- CI threshold: max 10 violations of any severity

---

## SFDX Project (`sfdx-project.json`)

```json
{
  "packageDirectories": [
    { "path": "force-app-examples" },
    { "path": "force-app", "default": true }
  ],
  "name": "LWCRecipes",
  "namespace": "",
  "sourceApiVersion": "63.0"
}
```

---

## GitHub Workflows

### `ci-pr.yml` (Pull Request Validation)

Triggers: `pull_request` (opened, edited, synchronize, reopened, ready_for_review)
Steps: prettier → validate-lwc → eslint → jest coverage → code analyzer → scratch org deploy → Apex tests → codecov
Dependabot: Auto-merges patch prod deps and minor/patch dev deps.

### `ci.yml` (Deploy to Prod)

Triggers: `push` to `main`, `workflow_dispatch`
Steps: checkout → install SF CLI → authenticate devhub → deploy with `RunAllTestsInOrg`

### `dependabot.yml` / `new-issue-welcome.yml`

Standard Dependabot config and new issue welcome message.

---

## Custom Tooling

### `validate-lwc.js`

AST-based validator using `@babel/parser` and `@babel/traverse`. Enforces the file structure ordering rules (see Code Guidelines). Runs on commit and in CI.

### `fix-lwc.js`

AST-based auto-fixer using `recast`. Automatically reorders top-level declarations and class body members to match the required structure. Preserves original formatting where possible.

Both scripts:

- Skip `__tests__/` and `__mocks__/` directories
- Accept file paths or directories as arguments
- Return non-zero exit code on validation errors
