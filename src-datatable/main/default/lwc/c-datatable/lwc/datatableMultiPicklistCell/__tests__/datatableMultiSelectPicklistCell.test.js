import { createElement } from "lwc";
import DatatableMultiPicklistCell from "c/datatableMultiPicklistCell";

describe("c-datatable-multi-picklist-cell", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("should set empty string when there are no options or no value", async () => {
    // Arrange
    const element = createElement("c-datatable-multi-picklist-cell", {
      is: DatatableMultiPicklistCell
    });

    document.body.appendChild(element);
    await Promise.resolve();

    expect(element.shadowRoot.textContent).toBe("");
  });

  it("should format output when there are options and value", async () => {
    // Arrange
    const element = Object.assign(
      createElement("c-datatable-multi-picklist-cell", {
        is: DatatableMultiPicklistCell
      }),
      {
        value: "1;2;4",
        options: JSON.stringify([
          { value: "1", label: "A" },
          { value: "2", label: "B" },
          { value: "3", label: "C" },
          { value: "4", label: "D" }
        ])
      }
    );

    document.body.appendChild(element);
    await Promise.resolve();

    expect(element.shadowRoot.textContent).toBe("A;B;D");
  });
});
