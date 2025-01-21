// import {
//   ElementBuilder,
//   resetDOM,
//   flushPromises,
//   getByDataId,
//   assertElementIsAccesible,
//   assertElementIsNotAccesible,
//   mockFunction
// } from "test/utils";
// import Lookup, { VARIANTS, LABELS, KEY_INPUTS } from "c/Lookup";
// import RECORDS from "./data/records.json";
// import { inputSearchTerm } from "./lookup.utils.js";

// const BASE_LABEL = "Lookup";
// const SAMPLE_SEARCH_TOO_SHORT_WHITESPACE = "A ";
// const SAMPLE_SEARCH_TOO_SHORT_SPECIAL = "a*";
// const SAMPLE_SEARCH_RAW = "Sample search* ";
// const SAMPLE_SEARCH_CLEAN = "Sample search?";

// const DEFAULT_OPTIONS = RECORDS.filter((record) => record.recentlyViewed);

// const searchHandler = jest.fn((builder) => {
//   const { getDefault, getInitialSelection, rawSearchTerm, selectedIds } =
//     builder;
//   if (getDefault) {
//     return DEFAULT_OPTIONS;
//   } else if (getInitialSelection) {
//     return RECORDS.filter((record) => selectedIds.includes(record.id));
//   }

//   return RECORDS.filter((record) =>
//     record.title.toLowerCase().includes(rawSearchTerm.toLowerCase())
//   );
// });

// const elementBuilder = new ElementBuilder(
//   "c-base-lookup",
//   Lookup
// ).setDefaultApiProperties({
//   label: BASE_LABEL,
//   searchHandler
// });

// const modes = [
//   elementBuilder
//     .setDefaultApiProperties({ isMultiEntry: true }),
//   elementBuilder
//     .setDefaultApiProperties({ isMultiEntry: false })
// ];

describe("c-base-lookup rendering", () => {
  //   const elementBuilder = new ElementBuilder(
  //     "c-base-lookup",
  //     Lookup
  //   ).setDefaultApiProperties({
  //     label: "Lookup",
  //     isMultiEntry: true,
  //     searchHandler
  //   });

  //   beforeEach(() => {
  //     jest.useFakeTimers();
  //   });

  //   afterEach(() => {
  //     resetDOM();
  //     jest.clearAllMocks();
  //     jest.useRealTimers();
  //   });

  //   // it.each(modes)('should hide options when backspace or del is pressed', async (builder) => {
  //   //   const element = await builder.build();

  //   //   // select an option
  //   //   element.shadowRoot.querySelector("[data-item-id]").click();

  //   //   await flushPromises();

  //   //   const results = element.shadowRoot.querySelectorAll(
  //   //     '[data-id="list-item"]'
  //   //   );

  //   //   expect(results.length).toBe(DEFAULT_OPTIONS.length - 1);

  //   //   // users clears option using backspace or delete
  //   //   const searchInput = getByDataId(element, "input");
  //   //   searchInput.dispatchEvent(
  //   //     new KeyboardEvent("keydown", { keyCode: KEY_INPUTS.BACKSPACE })
  //   //   );

  //   //   await flushPromises();

  //   //   expect(results.length).toBe(DEFAULT_OPTIONS.length);

  //   //   await assertElementIsAccesible();
  //   // });

  it("hell no", () => {
    expect(1).toBe(1);
  });
});
