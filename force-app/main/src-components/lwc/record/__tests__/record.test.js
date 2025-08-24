import Record from "c/record";
import { ElementBuilder, removeChildren, flushPromises } from "test/utils";
import RECORDS from "./data/records.json";
import { getRecords } from "lightning/uiRecordApi";

const elementBuilder = new ElementBuilder("c-record", Record);

describe("c-record", () => {
  let element;

  afterEach(() => {
    removeChildren();
    jest.clearAllMocks();
  });

  it("should display label for single value", async () => {
    element = await elementBuilder.build({
      value: RECORDS.results[0].result.id,
      displayField: "User.Name"
    });

    getRecords.emit(RECORDS);

    await flushPromises();

    expect(element.shadowRoot.textContent).toBe(
      RECORDS.results[0].result.fields.Name.value
    );
  });

  it("should display joined labels for multiple values", async () => {
    const ids = [RECORDS.results[0].result.id, RECORDS.results[1].result.id];
    element = await elementBuilder.build({
      value: ids,
      displayField: "User.Name",
      separator: " | "
    });

    getRecords.emit(RECORDS);

    await flushPromises();

    const expected = [
      RECORDS.results[0].result.fields.Name.value,
      RECORDS.results[1].result.fields.Name.value
    ].join(" | ");

    expect(element.shadowRoot.textContent).toBe(expected);
  });

  it("should display ids joined by separator if not fetched", async () => {
    const ids = [RECORDS.results[0].result.id, RECORDS.results[1].result.id];
    element = await elementBuilder.build({
      value: ids,
      displayField: "User.Name",
      separator: ";"
    });
    // Do not emit getRecords, so fetched is false
    await flushPromises();
    expect(element.shadowRoot.textContent).toBe(ids.join(";"));
  });

  it("should display empty string for empty value array", async () => {
    element = await elementBuilder.build({
      value: [],
      displayField: "User.Name"
    });
    await flushPromises();
    expect(element.shadowRoot.textContent).toBe("");
  });

  it("should display empty string for undefined value", async () => {
    element = await elementBuilder.build({
      value: undefined,
      displayField: "User.Name"
    });
    await flushPromises();
    expect(element.shadowRoot.textContent).toBe("");
  });
});
