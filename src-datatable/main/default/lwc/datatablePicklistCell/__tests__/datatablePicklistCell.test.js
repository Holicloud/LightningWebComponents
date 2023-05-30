import { createElement } from "lwc";
import DatatablePicklistCell from "c/datatablePicklistCell";

describe("c-datatable-picklist-cell", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("should set empty string when there are no options or no value", async () => {
    // Arrange
    const element = createElement("c-datatable-picklist-cell", {
      is: DatatablePicklistCell
    });

    document.body.appendChild(element);
    await Promise.resolve();

    expect(element.shadowRoot.textContent).toBe("");
  });

  it("should format output when there are options and value", async () => {
    // Arrange

    const element = Object.assign(
      createElement("c-datatable-picklist-cell", { is: DatatablePicklistCell }),
      {
        value: "2",
        options: JSON.stringify([
          { value: "1", label: "A" },
          { value: "2", label: "B" },
          { value: "3", label: "C" }
        ])
      }
    );

    document.body.appendChild(element);
    await Promise.resolve();

    expect(element.shadowRoot.textContent).toBe("B");
  });
});
