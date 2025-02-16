# Code Guidelines

- All constants should be in UPPER_SNAKE_CASE.
- All `data-id` properties should be in kebab-case.
- Constants that are arrays or objects should use `Object.freeze(value)`.
- Variables that have a single usage should be removed.
- All query selectors should use `data-id`.
- All Jest tests should create components using `ElementBuilder`.
- Avoid hardcoding values.
- Components should have a corresponding `__mocks__` file.
  - This file should include all `@api` props and methods.
- All Jest tests should test accessibility using `await assertElementIsAccesible(element);`
- All event handlers should start with the word handle
- @api that have getters setters should have a corresponding private property that starts with underscore
- jest component listeners should be tested as such
- ideally your jest test only has a single describe if more describe are needed add them as another test files
  const element = await elementBuilder.build();
  const focusFunction = mockListener(element, "focus");
  element.focus();

      expect(focusFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: {
            value: [DEFAULT_RECORDS[0].id],
            info: [DEFAULT_RECORDS[0]]
          }
        })
      );

- for testing on disconnectedCallback use removeFromDOM
- Refactor the test file to use ElementBuilder for creating the wizard component.
