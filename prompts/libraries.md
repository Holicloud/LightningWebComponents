# Libraries & Dependencies Reference

## Runtime Dependencies (None)

This project has **no runtime dependencies** — it is a pure Salesforce DX project. All npm packages are dev-only.

## Dev Dependencies

### Core Tooling

| Package       | Version | Purpose                          |
| ------------- | ------- | -------------------------------- |
| `eslint`      | ^9.38.0 | JavaScript linter (flat config)  |
| `prettier`    | ^3.6.2  | Code formatter                   |
| `husky`       | ^9.1.7  | Git hooks manager                |
| `lint-staged` | ^16.3.0 | Run linters on staged files only |

### Babel (AST Tooling)

| Package                | Version  | Purpose                                                  |
| ---------------------- | -------- | -------------------------------------------------------- |
| `@babel/core`          | ^7.28.5  | Babel compiler core                                      |
| `@babel/eslint-parser` | ^7.28.6  | ESLint parser for modern JS                              |
| `@babel/parser`        | ^7.29.0  | AST parser (used by `validate-lwc.js`)                   |
| `@babel/traverse`      | ^7.29.0  | AST traversal (used by `validate-lwc.js`)                |
| `recast`               | ^0.23.11 | AST printer preserving formatting (used by `fix-lwc.js`) |

### Salesforce / LWC

| Package                               | Version | Purpose                      |
| ------------------------------------- | ------- | ---------------------------- |
| `@salesforce/sfdx-lwc-jest`           | ^7.0.2  | LWC Jest testing adapter     |
| `@salesforce/eslint-config-lwc`       | ^4.0.0  | LWC recommended ESLint rules |
| `@salesforce/eslint-plugin-aura`      | ^3.0.0  | Aura ESLint plugin           |
| `@salesforce/eslint-plugin-lightning` | ^2.0.0  | Lightning platform ESLint    |
| `@lwc/eslint-plugin-lwc`              | ^3.4.0  | LWC-specific linting rules   |
| `@locker/eslint-config-locker`        | ^0.26.4 | Locker Service compatibility |

### Formatting Plugins

| Package                | Version | Purpose                 |
| ---------------------- | ------- | ----------------------- |
| `prettier-plugin-apex` | ^2.2.6  | Apex class formatting   |
| `@prettier/plugin-xml` | ^3.4.1  | XML/metadata formatting |

### Testing

| Package                | Version  | Purpose                            |
| ---------------------- | -------- | ---------------------------------- |
| `@sa11y/jest`          | ^7.4.0   | Accessibility testing matchers     |
| `jest-canvas-mock`     | ^2.5.2   | Mock `<canvas>` API for SLDS icons |
| `eslint-plugin-jest`   | ^29.15.0 | Jest-specific ESLint rules         |
| `eslint-plugin-import` | ^2.31.0  | Import/export linting              |

## Salesforce Platform Dependencies

| Dependency                            | Usage                                      |
| ------------------------------------- | ------------------------------------------ |
| `lightning/uiRecordApi`               | `record` component                         |
| `lightning/messageService`            | `messageChannelMixin`                      |
| `lightning/datatable`                 | `datatablePlus` extends it                 |
| `lightning/platformResourceLoader`    | `formattedMarkdown` loads static resources |
| `@salesforce/apex/LookupController.*` | `apexLookup` Apex calls                    |

## Static Resources

| Resource   | Component           | Purpose                                          |
| ---------- | ------------------- | ------------------------------------------------ |
| `markdown` | `formattedMarkdown` | `marked.js` library + CSS for Markdown rendering |
