import QuestionRuleCondition from "c/questionRuleCondition";
import getActiveCatalog from "@salesforce/apex/CTSI_QuestionRulesController.getActiveCatalog";
// No registerLwcWireAdapter import needed in this project pattern
import {
  ElementBuilder,
  removeChildren,
  flushPromises,
  getByDataId
} from "test/utils";

const elementBuilder = new ElementBuilder(
  "c-question-rule-condition",
  QuestionRuleCondition
);

// Mock Apex
jest.mock(
  "@salesforce/apex/CTSI_QuestionRulesController.getActiveCatalog",
  () => {
    const { createApexTestWireAdapter } = require("@salesforce/sfdx-lwc-jest");
    return {
      default: createApexTestWireAdapter(jest.fn())
    };
  },
  { virtual: true }
);

// getActiveCatalog already behaves as a wire adapter due to createApexTestWireAdapter

const mockCatalog = [
  { Id: "qc001", Question__c: "Question 1" },
  { Id: "qc002", Question__c: "Question 2" }
];

describe("c-question-rule-condition", () => {
  afterEach(() => {
    removeChildren();
    jest.clearAllMocks();
  });

  it("renders with basic props", async () => {
    const element = await elementBuilder.build({
      condition: {
        Source_Type__c: "Answer",
        Question_Catalog__c: "qc001",
        Operator__c: "Equals",
        Value__c: "Test",
        Not__c: false
      },
      index: 0,
      formDefinitionId: "fd001",
      questionCatalogId: "qc-current"
    });

    getActiveCatalog.emit(mockCatalog);

    await flushPromises();

    const radioGroup = getByDataId(element, "source-type-radio");
    expect(radioGroup.value).toBe("Answer");
  });

  it("dispatches update event on change", async () => {
    const element = await elementBuilder.build({
      condition: { Source_Type__c: "Answer" },
      index: 0
    });

    const handler = jest.fn();
    element.addEventListener("update", handler);

    // Using data-field here as it behaves similarly to data-id, but keeping logic consistent
    const combobox = element.shadowRoot.querySelector(
      'lightning-combobox[data-field="Operator__c"]'
    );
    combobox.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: "GreaterThan" }
      })
    );

    expect(handler).toHaveBeenCalled();
    expect(handler.mock.calls[0][0].detail.value.Operator__c).toBe(
      "GreaterThan"
    );
  });

  it("dispatches delete event", async () => {
    const element = await elementBuilder.build({
      index: 5
    });

    const handler = jest.fn();
    element.addEventListener("delete", handler);

    const deleteBtn = getByDataId(element, "delete-condition-btn");
    deleteBtn.click();

    expect(handler).toHaveBeenCalled();
    expect(handler.mock.calls[0][0].detail.index).toBe(5);
  });
});
