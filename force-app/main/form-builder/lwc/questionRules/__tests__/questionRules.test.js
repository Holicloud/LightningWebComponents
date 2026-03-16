import QuestionRules from "c/questionRules";
import getRules from "@salesforce/apex/CTSI_QuestionRulesController.getRules";
import activate from "@salesforce/apex/CTSI_QuestionRulesController.activate";
import deactivate from "@salesforce/apex/CTSI_QuestionRulesController.deactivate";
import deleteRule from "@salesforce/apex/CTSI_QuestionRulesController.deleteRule";
import NewQuestionRuleModal from "c/newQuestionRuleModal";
import { getRecord } from "lightning/uiRecordApi";
import {
  ElementBuilder,
  removeChildren,
  flushPromises,
  getByDataId,
  getAllByDataId
} from "test/utils";

const elementBuilder = new ElementBuilder("c-question-rules", QuestionRules);

// Mock Apex
jest.mock(
  "@salesforce/apex/CTSI_QuestionRulesController.getRules",
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
  () => {
    return {
      default: jest.fn()
    };
  },
  { virtual: true }
);

jest.mock(
  "@salesforce/apex/CTSI_QuestionRulesController.deactivate",
  () => {
    return {
      default: jest.fn()
    };
  },
  { virtual: true }
);

jest.mock(
  "@salesforce/apex/CTSI_QuestionRulesController.deleteRule",
  () => {
    return {
      default: jest.fn()
    };
  },
  { virtual: true }
);

// Mock Modal components
jest.mock(
  "c/newQuestionRuleModal",
  () => {
    return {
      open: jest.fn().mockResolvedValue(true)
    };
  },
  { virtual: true }
);

// Mock wire adapters
// Wires are emitted directly via the imported functions in this project
// getRecord and getRules already behave as wire adapters due to the mocks/environment setup.

const mockGetRecord = {
  fields: {
    Form_Definition__c: { value: "fd001" },
    Question__c: { value: "What is your name?" }
  }
};

const mockGetRules = [
  {
    Id: "rule001",
    Name: "Rule 1",
    Active__c: true,
    Logic_Type__c: "AND",
    Rule_Conditions__r: [
      {
        Id: "cond001",
        Source_Path__c: "Path 1",
        Operator__c: "Equals",
        Value__c: "Value 1"
      }
    ],
    CreatedDate: "2023-01-01T00:00:00Z"
  }
];

describe("c-question-rules", () => {
  afterEach(() => {
    removeChildren();
    jest.clearAllMocks();
  });

  it("renders rules correctly when data is provided", async () => {
    const element = await elementBuilder.build({
      questionCatalogId: "qc001"
    });

    // Emit data from wires
    // Emit data from wires
    getRecord.emit(mockGetRecord);
    getRules.emit(mockGetRules);

    // Wait for any asynchronous DOM updates
    await flushPromises();

    const panels = getAllByDataId(element, "panel");
    expect(panels.length).toBe(1);
    expect(panels[0].title).toBe("Rule 1");
  });

  it("shows 'No rules found' when there are no rules", async () => {
    const element = await elementBuilder.build({
      questionCatalogId: "qc001"
    });

    getRecord.emit(mockGetRecord);
    getRules.emit([]);

    await flushPromises();

    const noRulesMsg = element.shadowRoot.querySelector("p").textContent;
    expect(noRulesMsg).toBe("No rules defined for this question");
  });

  it("opens modal on Add Rule click", async () => {
    const element = await elementBuilder.build({
      questionCatalogId: "qc001"
    });

    getRecord.emit(mockGetRecord);
    getRules.emit(mockGetRules);

    await flushPromises();

    const addButton = getByDataId(element, "add-rule-btn");
    addButton.click();

    expect(NewQuestionRuleModal.open).toHaveBeenCalled();
  });

  it("toggles inactive rules display", async () => {
    const element = await elementBuilder.build({
      questionCatalogId: "qc001"
    });

    // Add an inactive rule to the mock
    const rulesWithInactive = [
      ...mockGetRules,
      {
        Id: "rule002",
        Name: "Inactive Rule",
        Active__c: false,
        Logic_Type__c: "AND",
        CreatedDate: "2023-01-01T00:00:00Z"
      }
    ];
    getRecord.emit(mockGetRecord);
    getRules.emit(rulesWithInactive);

    await flushPromises();

    // By default showInactive is true
    let panels = getAllByDataId(element, "panel");
    expect(panels.length).toBe(2);

    // Toggle off showInactive
    const toggle = getByDataId(element, "show-inactive-toggle");
    toggle.dispatchEvent(new CustomEvent("change"));

    await flushPromises();

    panels = getAllByDataId(element, "panel");
    expect(panels.length).toBe(1);
    expect(panels[0].title).toBe("Rule 1");
  });

  it("calls deactivate rule", async () => {
    const element = await elementBuilder.build({
      questionCatalogId: "qc001"
    });

    getRecord.emit(mockGetRecord);
    getRules.emit(mockGetRules);

    await flushPromises();

    const deactivateBtn = getByDataId(element, "deactivate-rule");
    deactivateBtn.click();

    await flushPromises();

    expect(deactivate).toHaveBeenCalledWith({
      questionRuleId: "rule001"
    });
  });

  it("calls activate rule", async () => {
    const inactiveRules = [
      {
        ...mockGetRules[0],
        Id: "rule002",
        Active__c: false
      }
    ];
    const element = await elementBuilder.build({
      questionCatalogId: "qc001"
    });

    getRecord.emit(mockGetRecord);
    getRules.emit(inactiveRules);

    await flushPromises();

    const activateBtn = getByDataId(element, "activate-rule");
    activateBtn.click();

    await flushPromises();

    expect(activate).toHaveBeenCalledWith({
      questionRuleId: "rule002"
    });
  });

  it("calls delete rule", async () => {
    const inactiveRules = [
      {
        ...mockGetRules[0],
        Id: "rule003",
        Active__c: false
      }
    ];
    const element = await elementBuilder.build({
      questionCatalogId: "qc001"
    });

    getRecord.emit(mockGetRecord);
    getRules.emit(inactiveRules);

    await flushPromises();

    const deleteBtn = getByDataId(element, "delete-rule");
    deleteBtn.click();

    await flushPromises();

    expect(deleteRule).toHaveBeenCalledWith({
      questionRuleId: "rule003"
    });
  });
});
