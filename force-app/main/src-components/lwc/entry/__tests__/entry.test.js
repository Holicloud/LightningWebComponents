import Entry from "c/entry";
import { removeChildren, ElementBuilder } from "test/utils";

const OPTIONS = {
  tesla: "Tesla electric vehicles",
  bmw: "BMW luxury cars",
  audi: "Audi premium automobiles"
};

const elementBuilder = new ElementBuilder("c-entry", Entry).setConfig({
  defaultApiProps: {
    options: OPTIONS
  }
});

describe("c-entry", () => {
  let element;

  afterEach(() => {
    removeChildren();
  });

  it("should display expected label", async () => {
    element = await elementBuilder.build({
      value: "tesla",
      options: OPTIONS
    });

    expect(element.shadowRoot.textContent).toBe(OPTIONS[element.value]);
  });

  it("should display value in brackets if not in options", async () => {
    element = await elementBuilder.build({
      value: "ford",
      options: OPTIONS
    });

    expect(element.shadowRoot.textContent).toBe("[ford]");
  });

  it("should display empty string for undefined value", async () => {
    element = await elementBuilder.build({
      value: undefined,
      options: OPTIONS
    });

    expect(element.shadowRoot.textContent).toBe("");
  });

  it("should display comma-separated labels for array values in options", async () => {
    element = await elementBuilder.build({
      value: ["tesla", "bmw"],
      options: OPTIONS
    });

    expect(element.shadowRoot.textContent).toBe(
      "Tesla electric vehicles,BMW luxury cars"
    );
  });

  it("should display comma-separated brackets for array values not in options", async () => {
    element = await elementBuilder.build({
      value: ["ford", "toyota"],
      options: OPTIONS
    });

    expect(element.shadowRoot.textContent).toBe("[ford],[toyota]");
  });

  it("should use custom separator for array values", async () => {
    element = await elementBuilder.build({
      value: ["tesla", "bmw"],
      options: OPTIONS,
      separator: " | "
    });

    expect(element.shadowRoot.textContent).toBe(
      "Tesla electric vehicles | BMW luxury cars"
    );
  });

  it("should display empty string for empty array", async () => {
    element = await elementBuilder.build({
      value: [],
      options: OPTIONS
    });

    expect(element.shadowRoot.textContent).toBe("");
  });
});
