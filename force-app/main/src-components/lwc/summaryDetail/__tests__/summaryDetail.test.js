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

    expect(getSummaryClassAttribute()).toContain("slds-is-open");
    expect(getButton()).toBeNull();
    await expect(element).toBeAccessible();
  });

  it("should collapsed content when button is clicked", async () => {
    element = await elementBuilder.build();

    const button = getButton();
    expect(button.ariaExpanded).toBe("true");

    button.click();
    await flushPromises();

    expect(button.ariaExpanded).toBe("false");
    expect(getSummaryClassAttribute()).not.toContain("slds-is-open");
    await expect(element).toBeAccessible();
  });

  it("should be expand or collected", async () => {
    element = await elementBuilder.build({ isCollapsed: false });

    let summaryClassAttribute = getSummaryClassAttribute();
    expect(summaryClassAttribute).toContain("slds-is-open");
    
    element.isCollapsed = true;
    await flushPromises();

    summaryClassAttribute = getSummaryClassAttribute();
    expect(summaryClassAttribute).not.toContain("slds-is-open");
    await expect(element).toBeAccessible();
    
  });
});
