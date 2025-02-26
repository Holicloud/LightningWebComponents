jest.mock("c/lookup");
jest.mock(
  "@salesforce/apex/LookupController.getDefaultNonCacheable",
  () => ({
    default: jest.fn()
  }),
  { virtual: true }
);
jest.mock(
  "@salesforce/apex/LookupController.getMatchingNonCacheable",
  () => ({
    default: jest.fn()
  }),
  { virtual: true }
);
jest.mock(
  "@salesforce/apex/LookupController.getSelectionNonCacheable",
  () => ({
    default: jest.fn()
  }),
  { virtual: true }
);
jest.mock(
  "@salesforce/apex/LookupController.getDefault",
  () => ({
    default: jest.fn()
  }),
  { virtual: true }
);
jest.mock(
  "@salesforce/apex/LookupController.getMatching",
  () => ({
    default: jest.fn()
  }),
  { virtual: true }
);
jest.mock(
  "@salesforce/apex/LookupController.getSelection",
  () => ({
    default: jest.fn()
  }),
  { virtual: true }
);

import ApexLookup from "c/apexLookup";
import getDefault from "@salesforce/apex/LookupController.getDefault";
import getDefaultNonCacheable from "@salesforce/apex/LookupController.getDefaultNonCacheable";
import getMatching from "@salesforce/apex/LookupController.getMatching";
import getMatchingNonCacheable from "@salesforce/apex/LookupController.getMatchingNonCacheable";
import getSelection from "@salesforce/apex/LookupController.getSelection";
import getSelectionNonCacheable from "@salesforce/apex/LookupController.getSelectionNonCacheable";
import {
  ElementBuilder,
  removeChildren,
  getByDataId,
  createMockedEventListener
} from "test/utils";

import RECORDS from "./data/records.json";

const elementBuilder = new ElementBuilder(
  "c-apex-lookup",
  ApexLookup
).setConfig({
  defaultApiProps: {
    apexClass: "ApexClass"
  }
});

describe("c-apex-lookup", () => {
  let element;

  const lookup = () => getByDataId(element, "lookup");

  afterEach(() => {
    removeChildren();
  });

  it("should report validity", async () => {
    element = await elementBuilder.build();

    lookup().validity = true;

    expect(element.validity).toBe(true);
  });

  it("should focus", async () => {
    element = await elementBuilder.build();

    element.focus();

    expect(lookup().focus).toHaveBeenCalled();
  });

  it("should blur", async () => {
    element = await elementBuilder.build();

    element.blur();

    expect(lookup().blur).toHaveBeenCalled();
  });

  it("should checkValidity", async () => {
    element = await elementBuilder.build();

    element.checkValidity();

    expect(lookup().checkValidity).toHaveBeenCalled();
  });

  it("should reportValidity", async () => {
    element = await elementBuilder.build();

    element.reportValidity();

    expect(lookup().reportValidity).toHaveBeenCalled();
  });

  it("should showHelpMessageIfInvalid", async () => {
    element = await elementBuilder.build();

    element.showHelpMessageIfInvalid();

    expect(lookup().showHelpMessageIfInvalid).toHaveBeenCalled();
  });

  it("should dispatch events", async () => {
    element = await elementBuilder.build();
    const invalid = createMockedEventListener(element, "invalid");
    const focus = createMockedEventListener(element, "focus");
    const blur = createMockedEventListener(element, "blur");
    const action = createMockedEventListener(element, "action");
    const change = createMockedEventListener(element, "change");

    const lookupEl = lookup();

    lookupEl.dispatchEvent(new CustomEvent("invalid"));
    lookupEl.dispatchEvent(new CustomEvent("blur"));
    lookupEl.dispatchEvent(new CustomEvent("focus"));
    lookupEl.dispatchEvent(new CustomEvent("action"));
    lookupEl.dispatchEvent(new CustomEvent("change"));

    expect(invalid).toHaveBeenCalled();
    expect(focus).toHaveBeenCalled();
    expect(blur).toHaveBeenCalled();
    expect(action).toHaveBeenCalled();
    expect(change).toHaveBeenCalled();
  });

  it("should use non cacheable implementations", async () => {
    element = await elementBuilder.build({
      isNonCacheable: true,
      payload: {
        foo: "bar"
      }
    });

    getDefaultNonCacheable.mockResolvedValue(RECORDS);
    getMatchingNonCacheable.mockResolvedValue(RECORDS);
    getSelectionNonCacheable.mockResolvedValue(RECORDS);

    const expected = {
      apexClass: element.apexClass,
      payload: JSON.stringify(element.payload)
    };

    expect(getDefaultNonCacheable).toHaveBeenCalledWith(expected);

    const lookupEl = lookup();
    lookupEl.searchHandler();
    lookupEl.selectionHandler();

    expect(getMatchingNonCacheable).toHaveBeenCalledWith(
      expect.objectContaining(expected)
    );
    expect(getSelectionNonCacheable).toHaveBeenCalledWith(
      expect.objectContaining(expected)
    );
  });

  it("should use cacheable implementations", async () => {
    element = await elementBuilder.build({
      payload: {
        foo: "bar"
      }
    });

    getDefault.mockResolvedValue(RECORDS);
    getMatching.mockResolvedValue(RECORDS);
    getSelection.mockResolvedValue(RECORDS);

    const expected = {
      apexClass: element.apexClass,
      payload: JSON.stringify(element.payload)
    };

    expect(getDefault).toHaveBeenCalledWith(expected);

    const lookupEl = lookup();
    lookupEl.searchHandler();
    lookupEl.selectionHandler();

    expect(getMatching).toHaveBeenCalledWith(expect.objectContaining(expected));
    expect(getSelection).toHaveBeenCalledWith(
      expect.objectContaining(expected)
    );
  });
});
