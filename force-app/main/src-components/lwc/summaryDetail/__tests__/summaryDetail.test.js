import SummaryDetail from "c/summaryDetail";
import {
  ElementBuilder,
  flushPromises,
  removeChildren,
  getByDataId
} from "test/utils";

const elementBuilder = new ElementBuilder("c-summary-detail", SummaryDetail);

describe("c-summary-detail", () => {
  let element;
  const getSummaryClassAttribute = () => {
    return getByDataId(element, "summary-class").getAttribute("class");
  };
  const getButton = () => {
    return getByDataId(element, "toggle");
  };

  afterEach(() => {
    removeChildren();
  });

  it("should show if it is nonCollapsed", async () => {
    element = await elementBuilder.build({
      isNonCollapsible: true
    });
    const summaryClassAttribute = getSummaryClassAttribute();
    const button = getButton();
    expect(summaryClassAttribute).toContain("slds-is-open");
    expect(button).toBeNull();
    await expect(element).toBeAccessible();
  });

  it("should collapsed content when button is clicked", async () => {
    element = await elementBuilder.build();

    const button = getButton();
    button.click();

    expect(button.ariaExpanded).toBe("true");
    await flushPromises();

    const summaryClassAttribute = getSummaryClassAttribute();
    expect(button.ariaExpanded).toBe("false");
    expect(summaryClassAttribute).not.toContain("slds-is-open");
    await expect(element).toBeAccessible();
  });

  it("should be expand content", async () => {
    element = await elementBuilder.build({ isCollapsed: false });

    const summaryClassAttribute = getSummaryClassAttribute();
    expect(summaryClassAttribute).toContain("slds-is-open");
    await expect(element).toBeAccessible();
  });
});
