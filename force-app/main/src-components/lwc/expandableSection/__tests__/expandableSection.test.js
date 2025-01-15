import { createElement } from "lwc";
import ExpandableSection from "c/expandableSection";
import { setImmediate } from "timers";

describe("c-expandable-section", () => {
  function createExpandableSection(props = {}) {
    const element = createElement("c-expandable-section", {
      is: ExpandableSection
    });
    Object.assign(element, props);
    document.body.appendChild(element);
    return element;
  }

  async function flushPromises() {
    return new Promise((resolve) => setImmediate(resolve));
  }

  function getByDataId(element, dataId) { 
    return element.shadowRoot.querySelector(`[data-id="${dataId}"]`); 
  }

  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("should show if it is nonCollapsed", () => {
    const element = createExpandableSection({
      nonCollapsible: true,
      title: "Test title"
    });

    const sectionClasses = getByDataId(element, 'section')
      .getAttribute("class");
    const titleElement = getByDataId(element, 'title');
    expect(sectionClasses).toContain("slds-is-open");
    expect(titleElement.title).toBe(element.title);
    expect(titleElement.textContent).toBe(element.title);
  });

  it("should collapsed/expand content when button is clicked", async () => {
    const element = createExpandableSection();

    const button = getByDataId(element, 'toggle');
    button.click();

    expect(button.ariaExpanded).toBe("true");
    await flushPromises();

    const sectionClasses = getByDataId(element, 'section')
      .getAttribute("class");
    expect(button.ariaExpanded).toBe("false");
    expect(sectionClasses).not.toContain("slds-is-open");
  });

  it("should be collapsed", async () => {
    const element = createExpandableSection({ isCollapsed: true });

    const sectionClasses = getByDataId(element, 'section')
      .getAttribute("class");
    expect(sectionClasses).not.toContain("slds-is-open");
  });
});