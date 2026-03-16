import NewQuestionRuleModal from "c/newQuestionRuleModal";
import getRule from "@salesforce/apex/CTSI_QuestionRulesController.getRule";
import {
  ElementBuilder,
  removeChildren,
  flushPromises,
  getByDataId
} from "test/utils";
import { closeMock } from "lightning/modal";

// Mock Apex
jest.mock(
  "@salesforce/apex/CTSI_QuestionRulesController.getRule",
  () => {
    const { createApexTestWireAdapter } = require("@salesforce/sfdx-lwc-jest");
    return {
      default: createApexTestWireAdapter(jest.fn())
    };
  },
  { virtual: true }
);

jest.mock(
  "@salesforce/apex",
  () => {
    return {
      refreshApex: jest.fn().mockResolvedValue()
    };
  },
  { virtual: true }
);

jest.mock(
  "@salesforce/apex/CTSI_QuestionRulesController.updateConditions",
  () => {
    return {
      default: jest.fn().mockResolvedValue()
    };
  },
  { virtual: true }
);

// Mock booleanExpressionEngine
jest.mock(
  "c/booleanExpressionEngine",
  () => {
    return {
      validateExpression: jest
        .fn()
        .mockReturnValue({ valid: true, message: "" }),
      evaluateExpression: jest.fn().mockReturnValue(true)
    };
  },
  { virtual: true }
);

const updateConditionsMock =
  require("@salesforce/apex/CTSI_QuestionRulesController.updateConditions").default;
const { validateExpression } = require("c/booleanExpressionEngine");

const elementBuilder = new ElementBuilder(
  "c-new-question-rule-modal",
  NewQuestionRuleModal
);

const mockRuleData = {
  Id: "rule001",
  Name: "Test Rule",
  Active__c: true,
  Logic_Type__c: "AND",
  Rule_Type__c: "Autopopulated",
  Rule_Conditions__r: [
    {
      Id: "cond001",
      Source_Type__c: "Answer",
      Operator__c: "Equals",
      Value__c: "Yes"
    }
  ]
};

async function dispatchLogicTypeChange(element, value) {
  const logicTypeField = getByDataId(element, "logic-type-field");
  logicTypeField.dispatchEvent(
    new CustomEvent("change", {
      detail: { value },
      target: { fieldName: "Logic_Type__c" }
    })
  );
  await flushPromises();
}

describe("c-new-question-rule-modal", () => {
  afterEach(() => {
    removeChildren();
    jest.clearAllMocks();
  });

  it("renders with rule data when questionRuleId is provided", async () => {
    const element = await elementBuilder.build({
      questionRuleId: "rule001",
      questionCatalogId: "qc001",
      questionCatalogName: "Test Question"
    });

    getRule.emit(mockRuleData);

    await flushPromises();

    const inputName = getByDataId(element, "name-input");
    expect(inputName.value).toBe("Test Rule");
  });

  it("adds a condition when button is clicked", async () => {
    const element = await elementBuilder.build({
      questionCatalogId: "qc001"
    });

    await dispatchLogicTypeChange(element, "AND");

    const addButton = getByDataId(element, "add-condition-btn");
    addButton.click();

    await flushPromises();

    const conditions = element.shadowRoot.querySelectorAll(
      "c-question-rule-condition"
    );
    expect(conditions.length).toBe(1);
  });

  it("removes a condition on delete event", async () => {
    const element = await elementBuilder.build({
      questionCatalogId: "qc001"
    });

    await dispatchLogicTypeChange(element, "AND");

    const addButton = getByDataId(element, "add-condition-btn");
    addButton.click();
    await flushPromises();
    addButton.click();
    await flushPromises();

    let conditionItems = element.shadowRoot.querySelectorAll(
      "c-question-rule-condition"
    );
    expect(conditionItems.length).toBe(2);

    conditionItems[0].dispatchEvent(
      new CustomEvent("delete", {
        detail: { index: 0 }
      })
    );

    await flushPromises();

    conditionItems = element.shadowRoot.querySelectorAll(
      "c-question-rule-condition"
    );
    expect(conditionItems.length).toBe(1);
  });

  it("updates a condition on update event", async () => {
    const element = await elementBuilder.build({
      questionCatalogId: "qc001"
    });

    await dispatchLogicTypeChange(element, "AND");

    getByDataId(element, "add-condition-btn").click();
    await flushPromises();

    const conditions = element.shadowRoot.querySelectorAll(
      "c-question-rule-condition"
    );
    expect(conditions.length).toBe(1);

    const conditionItem = conditions[0];

    const updatedValue = {
      Source_Type__c: "Answer",
      Operator__c: "Not Equals",
      Value__c: "No"
    };

    conditionItem.dispatchEvent(
      new CustomEvent("update", {
        detail: { index: 0, value: updatedValue }
      })
    );

    await flushPromises();
  });

  it("closes on cancel", async () => {
    const element = await elementBuilder.build();

    const cancelBtn = getByDataId(element, "cancel-btn");
    cancelBtn.click();

    expect(closeMock).toHaveBeenCalled();
  });

  it("handles form submission and updates conditions", async () => {
    const element = await elementBuilder.build({
      questionCatalogId: "qc001"
    });

    const editForm = element.shadowRoot.querySelector(
      "lightning-record-edit-form"
    );
    editForm.submit = jest.fn();

    const saveBtn = getByDataId(element, "save-btn");
    saveBtn.click();

    await flushPromises();

    editForm.dispatchEvent(
      new CustomEvent("success", {
        detail: { id: "newRuleId" }
      })
    );

    await flushPromises();
    await flushPromises();

    expect(updateConditionsMock).toHaveBeenCalled();
    expect(closeMock).toHaveBeenCalledWith(true);
  });

  it("validates custom logic on change", async () => {
    const element = await elementBuilder.build({
      questionCatalogId: "qc001"
    });

    validateExpression.mockReturnValue({
      valid: false,
      message: "Invalid logic"
    });

    await dispatchLogicTypeChange(element, "Custom");

    const conditionLogicField = getByDataId(element, "condition-logic-field");
    expect(conditionLogicField).not.toBeNull();

    conditionLogicField.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: "1 AND 2" },
        target: { fieldName: "Condition_Logic__c" }
      })
    );

    expect(validateExpression).toHaveBeenCalled();
  });

  it("toggles fields based on rule type", async () => {
    const element = await elementBuilder.build({
      questionCatalogId: "qc001"
    });

    const ruleTypeField = getByDataId(element, "rule-type-field");

    ruleTypeField.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: "Overwrite Picklist Values" },
        target: { fieldName: "Rule_Type__c" }
      })
    );
    await flushPromises();

    const overwriteField = getByDataId(
      element,
      "overwrite-picklist-values-field"
    );
    expect(overwriteField).not.toBeNull();

    ruleTypeField.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: "Autopopulated" },
        target: { fieldName: "Rule_Type__c" }
      })
    );
    await flushPromises();

    const autopopulateTypeField = getByDataId(
      element,
      "autopopulate-source-type-field"
    );
    expect(autopopulateTypeField).not.toBeNull();

    autopopulateTypeField.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: "Raw" },
        target: { fieldName: "Autopopulate_Source_Type__c" }
      })
    );
    await flushPromises();

    const rawValueField = getByDataId(element, "autopopulate-value-raw-field");
    expect(rawValueField).not.toBeNull();
  });

  it("limits number of conditions to MAX_NUMBER_OF_CONDITIONS", async () => {
    const element = await elementBuilder.build({
      questionCatalogId: "qc001"
    });

    await dispatchLogicTypeChange(element, "AND");

    const addButton = getByDataId(element, "add-condition-btn");

    for (let i = 0; i < 9; i++) {
      addButton.click();
    }

    await flushPromises();

    const addButtonAfter = getByDataId(element, "add-condition-btn");
    expect(addButtonAfter).toBeNull();
  });
});
