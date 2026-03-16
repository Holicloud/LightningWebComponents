import SelectQuestionRule from "c/selectQuestionRule";
import getRulesByFormDefinition from "@salesforce/apex/CTSI_QuestionRulesController.getRulesByFormDefinition";
import getActiveCatalog from "@salesforce/apex/CTSI_QuestionRulesController.getActiveCatalog";
import activate from "@salesforce/apex/CTSI_QuestionRulesController.activate";
import deactivate from "@salesforce/apex/CTSI_QuestionRulesController.deactivate";
import NewQuestionRuleModal from "c/newQuestionRuleModal";
import {
  ElementBuilder,
  removeChildren,
  flushPromises,
  getByDataId
} from "test/utils";

const elementBuilder = new ElementBuilder(
  "c-select-question-rule",
  SelectQuestionRule
);

// Mock Apex
jest.mock(
  "@salesforce/apex/CTSI_QuestionRulesController.getRulesByFormDefinition",
  () => {
    const { createApexTestWireAdapter } = require("@salesforce/sfdx-lwc-jest");
    return {
      default: createApexTestWireAdapter(jest.fn())
    };
  },
  { virtual: true }
);

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

jest.mock(
  "@salesforce/apex/CTSI_QuestionRulesController.activate",
  () => ({
    default: jest.fn().mockResolvedValue()
  }),
  { virtual: true }
);

jest.mock(
  "@salesforce/apex/CTSI_QuestionRulesController.deactivate",
  () => ({
    default: jest.fn().mockResolvedValue()
  }),
  { virtual: true }
);

jest.mock(
  "@salesforce/apex/CTSI_QuestionRulesController.deleteRule",
  () => ({
    default: jest.fn().mockResolvedValue()
  }),
  { virtual: true }
);

jest.mock(
  "c/newQuestionRuleModal",
  () => ({
    open: jest.fn().mockResolvedValue(true)
  }),
  { virtual: true }
);

const MOCK_RULES = [
  {
    Id: "rule1",
    Name: "Rule 1",
    Active__c: true,
    Question_Catalog__c: "qc1",
    Question_Catalog__r: { Question__c: "Question 1" },
    Logic_Type__c: "AND",
    Rule_Type__c: "Autopopulated",
    CreatedDate: "2023-01-01T00:00:00Z"
  }
];

const MOCK_CATALOG = [
  { Id: "qc1", Question__c: "Question 1" },
  { Id: "qc2", Question__c: "Question 2" }
];

describe("c-select-question-rule", () => {
  afterEach(() => {
    removeChildren();
    jest.clearAllMocks();
  });

  it("renders rules and catalog data", async () => {
    const element = await elementBuilder.build({
      recordId: "fd001"
    });

    getRulesByFormDefinition.emit(MOCK_RULES);
    getActiveCatalog.emit(MOCK_CATALOG);

    await flushPromises();

    const groupTitle = getByDataId(element, "question-name");
    expect(groupTitle.textContent).toContain("Question 1");

    const ruleName = getByDataId(element, "panel");
    expect(ruleName.title).toBe("Rule 1");
  });

  it("filters rules by question", async () => {
    const element = await elementBuilder.build({
      recordId: "fd001"
    });

    getRulesByFormDefinition.emit(MOCK_RULES);
    getActiveCatalog.emit(MOCK_CATALOG);

    await flushPromises();

    const combobox = element.shadowRoot.querySelector("lightning-combobox");
    combobox.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: "qc2" }
      })
    );

    await flushPromises();

    const rules = element.shadowRoot.querySelectorAll(".slds-box");
    expect(rules.length).toBe(0); // qc2 has no rules
  });

  it("opens add rule modal", async () => {
    const element = await elementBuilder.build({
      recordId: "fd001"
    });

    const addBtn = getByDataId(element, "add-rule");
    addBtn.click();

    await flushPromises();

    expect(NewQuestionRuleModal.open).toHaveBeenCalled();
  });

  it("calls deactivate rule", async () => {
    const element = await elementBuilder.build({
      recordId: "fd001"
    });

    getRulesByFormDefinition.emit(MOCK_RULES);
    await flushPromises();

    const deactivateBtn = getByDataId(element, "deactivate-rule");
    deactivateBtn.click();

    await flushPromises();

    expect(deactivate).toHaveBeenCalledWith({
      questionRuleId: "rule1"
    });
  });

  it("calls activate rule", async () => {
    const inactiveRules = [
      {
        ...MOCK_RULES[0],
        Id: "rule2",
        Active__c: false
      }
    ];
    const element = await elementBuilder.build({
      recordId: "fd001"
    });

    getRulesByFormDefinition.emit(inactiveRules);
    await flushPromises();

    const activateBtn = getByDataId(element, "activate-rule");
    activateBtn.click();

    await flushPromises();

    expect(activate).toHaveBeenCalledWith({
      questionRuleId: "rule2"
    });
  });
});
