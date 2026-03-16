import QuestionCatalog, { LABELS } from "c/questionCatalog";
import getCatalogAndAnswers from "@salesforce/apex/CTSI_QuestionCatalogController.getCatalogAndAnswers";
import { ElementBuilder, removeChildren, flushPromises } from "test/utils";

const elementBuilder = new ElementBuilder(
  "c-question-catalog",
  QuestionCatalog
);

// Mock Apex
jest.mock(
  "@salesforce/apex/CTSI_QuestionCatalogController.getCatalogAndAnswers",
  () => ({
    default: jest.fn()
  }),
  { virtual: true }
);

// Mock RuleEngine to return simple results
jest.mock("../ruleEngine", () => {
  return jest.fn().mockImplementation(() => {
    return {
      evaluateOnLoad: () => ({
        hidden: {},
        required: {},
        readOnly: {},
        overwritePicklistValues: {}
      }),
      evaluateOnChange: () => ({
        hidden: {},
        required: {},
        readOnly: {},
        overwritePicklistValues: {}
      })
    };
  });
});

const MOCK_DATA = {
  catalog: [
    {
      Id: "q1",
      Question__c: "What is your name?",
      Answer_Data_Type__c: "Text",
      Required__c: true
    }
  ],
  answers: [{ Question_Catalog__c: "q1", Answer__c: "John Doe" }],
  rules: []
};

describe("c-question-catalog", () => {
  afterEach(() => {
    removeChildren();
    jest.clearAllMocks();
  });

  it("loads and renders catalog questions", async () => {
    getCatalogAndAnswers.mockResolvedValue(MOCK_DATA);

    const element = await elementBuilder.build({
      formDefinitionId: "fd001",
      editable: true
    });

    // Wait for async initialization
    await flushPromises();
    await flushPromises();
    await flushPromises();

    // Check for input fields
    const inputs = element.shadowRoot.querySelectorAll("c-question-input");
    expect(inputs.length).toBeGreaterThan(0);
    expect(inputs[0].label).toBe("What is your name?");
  });

  it("displays message when no questions found", async () => {
    getCatalogAndAnswers.mockResolvedValue({ catalog: [] });

    const element = await elementBuilder.build({
      formDefinitionId: "fd001"
    });

    await flushPromises();
    await flushPromises();
    await flushPromises();

    // Check if loading spinner is gone
    const spinner = element.shadowRoot.querySelector("lightning-spinner");
    expect(spinner).toBeNull();

    const emptyMsg = element.shadowRoot.querySelector(
      ".slds-text-align_center p"
    );
    expect(emptyMsg.textContent).toBe(LABELS.noQuestions);
  });

  it("handles answer update and re-evaluates rules", async () => {
    getCatalogAndAnswers.mockResolvedValue(MOCK_DATA);
    const element = await elementBuilder.build({
      formDefinitionId: "fd001",
      editable: true
    });

    // Multiple flushes because of initialization sequence
    await flushPromises();
    await flushPromises();
    await flushPromises();

    const input = element.shadowRoot.querySelector("c-question-input");
    expect(input).not.toBeNull();

    // Dispatch update event from child
    input.dispatchEvent(
      new CustomEvent("update", {
        detail: { value: "Jane Doe" }
      })
    );

    await flushPromises();

    // Verify answers updated (internal state, but we check if it doesn't crash
    // and if RuleEngine was called)
    const RuleEngine = require("../ruleEngine");
    expect(RuleEngine).toHaveBeenCalled();
  });
});
