import { refreshApex } from "@salesforce/apex";
import activate from "@salesforce/apex/CTSI_QuestionRulesController.activate";
import deactivate from "@salesforce/apex/CTSI_QuestionRulesController.deactivate";
import deleteRule from "@salesforce/apex/CTSI_QuestionRulesController.deleteRule";
import getRules from "@salesforce/apex/CTSI_QuestionRulesController.getRules";
import PARENT_RECORD_ID_FIELD from "@salesforce/schema/Question_Catalog__c.Form_Definition__c";
import QUESTION_FIELD from "@salesforce/schema/Question_Catalog__c.Question__c";
import NewQuestionRuleModal from "c/newQuestionRuleModal";
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import { LightningElement, api, wire, track } from "lwc";

const LABELS = Object.freeze({
  addRule: "Add Rule",
  showInactive: "Show Inactive",
  inactiveToggleLabel: "All (Active And Inactive)",
  activeToggleLabel: "Only Active Rules",
  ruleName: "Rule Name",
  deactivateRule: "Deactivate",
  deleteRule: "Delete",
  activateRule: "Activate",
  save: "Save",
  logicOptions: "When...",
  editRule: "Edit",
  noRulesFound: "No rules defined for this question",
  conditionLogic: "Condition Logic",
  conditionLogicHelpText:
    "Use parentheses, AND, OR, and NOT to customize the logic. For example, if you enter “(1 AND 2 AND 3) OR 4”, the flow evaluates whether the first three conditions are true or only the fourth condition is true."
});

const LOGICAL_OPTONS = Object.freeze({
  AND: "All Conditions Are Met (AND)",
  OR: "Any Condition Is Met (OR)",
  Custom: "Custom Condition Logic Is Met",
  Always: "Always"
});

const SOURCE_TYPES = Object.freeze({
  Answer: "Answer",
  Context: "Context"
});

export default class QuestionRules extends LightningElement {
  @api questionCatalogId;
  @track rules = [];
  LABELS = LABELS;
  logicOptions = Object.entries(LOGICAL_OPTONS).map(([key, value]) => ({
    label: value,
    value: key
  }));

  showInactive = true;

  sourceTypes = [
    {
      label: SOURCE_TYPES.Answer,
      value: SOURCE_TYPES.Answer
    },
    {
      label: SOURCE_TYPES.Context,
      value: SOURCE_TYPES.Context
    }
  ];

  wiredRules;

  @wire(getRecord, {
    recordId: "$questionCatalogId",
    fields: [PARENT_RECORD_ID_FIELD, QUESTION_FIELD]
  })
  questionCatalog;

  @wire(getRules, { questionCatalogId: "$questionCatalogId" })
  handleGetRules(result) {
    this.wiredRules = result;
    const { error, data } = result;
    if (error) {
      // TODO: Error handling
    } else if (data) {
      this.rules = data;
    }
  }

  get computedRules() {
    let result = JSON.parse(JSON.stringify(this.rules));

    if (!this.showInactive) {
      result = result.filter((rule) => rule.Active__c === true);
    }

    return result.map((rule) => {
      const isActive = !!rule.Active__c;

      rule.computedConditions = rule.Rule_Conditions__r?.map((condition) => ({
        ui: {
          sourcePath:
            condition.Source_Path__c ||
            condition.Question_Catalog__r?.Question__c
        },
        ...condition
      }));
      return {
        ui: {
          activationAllowed: rule.CreatedDate && !isActive,
          deletionAllowed: rule.CreatedDate && !isActive,
          deactivationAllowed: rule.CreatedDate && isActive,
          isDraft: !rule.CreatedDate,
          isCustomLogicType: rule.Logic_Type__c === "Custom",
          isAutopopulated: rule.Rule_Type__c === "Autopopulated",
          // autopopulatedValue: rule.Autopopulate_Source_Path__c || rule.Autopopulate_Value_Raw__c,
          logicType:
            rule.Logic_Type__c === "Custom"
              ? `Custom Condition Match (${rule.Condition_Logic__c})`
              : LOGICAL_OPTONS[rule.Logic_Type__c] || ""
        },
        ...rule
      };
    });
  }

  get formDefinitionId() {
    return getFieldValue(this.questionCatalog.data, PARENT_RECORD_ID_FIELD);
  }

  get questionCatalogName() {
    return getFieldValue(this.questionCatalog.data, QUESTION_FIELD);
  }

  async handleActivateRule(event) {
    await activate({
      questionRuleId: event.target.dataset.ruleId
    });
    refreshApex(this.wiredRules);
  }

  async handleAddRule() {
    await NewQuestionRuleModal.open({
      label: "Add Rule",
      questionCatalogId: this.questionCatalogId,
      questionCatalogName: this.questionCatalogName,
      formDefinitionId: this.formDefinitionId
    });

    refreshApex(this.wiredRules);
  }

  async handleDeactivateRule(event) {
    await deactivate({
      questionRuleId: event.target.dataset.ruleId
    });
    refreshApex(this.wiredRules);
  }

  async handleDeleteRule(event) {
    await deleteRule({
      questionRuleId: event.target.dataset.ruleId
    });
    refreshApex(this.wiredRules);
  }

  async handleEditRule(event) {
    const questionRuleId = event.target.dataset.ruleId;

    const result = await NewQuestionRuleModal.open({
      label: "Edit Rule",
      questionRuleId,
      questionCatalogId: this.questionCatalogId,
      questionCatalogName: this.questionCatalogName,
      formDefinitionId: this.formDefinitionId
    });

    if (result) {
      refreshApex(this.wiredRules);
    }
  }

  toggleShowInactive() {
    this.showInactive = !this.showInactive;
  }
}
