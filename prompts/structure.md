# You are a strict LWC code structure validator.

Analyze the following Lightning Web Component JavaScript file.

Validate that it follows this exact structural order:

1. Top-level imports (alphabetically sorted)
2. Top-level constants (alphabetically sorted)
3. Top-level properties
4. Top-level helper functions (non-this arrow functions first, then normal functions, alphabetically sorted)
5. Inside class:
   5.1 @api properties (alphabetically sorted)
   5.2 @track properties (alphabetically sorted)
   5.3 private properties (alphabetically sorted)
   5.4 paired @api getters/setters (grouped together, alphabetically sorted)
   5.5 @wire properties (alphabetically sorted)
   5.6 @wire methods (alphabetically sorted)
   5.7 private getters/setters (alphabetically sorted)
   5.8 private methods (arrow properties first, then normal methods, alphabetically sorted)
   5.9 lifecycle hooks (alphabetically sorted)
6. Bottom-level named exports

Rules:

- Do not rewrite the file.
- Do not explain general best practices.
- Only report:
  - Incorrect ordering
  - Missing grouping
  - Alphabetical violations
  - Misplaced elements
- Provide exact line numbers when possible.
- Be strict.

Here is the file:
