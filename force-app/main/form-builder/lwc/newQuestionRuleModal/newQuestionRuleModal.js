import { refreshApex } from "@salesforce/apex";

import getRule from "@salesforce/apex/CTSI_QuestionRulesController.getRule";
import updateConditions from "@salesforce/apex/CTSI_QuestionRulesController.updateConditions";
import { validateExpression } from "c/booleanExpressionEngine";

import LightningModal from "lightning/modal";
import { api, wire, track } from "lwc";

const MAX_NUMBER_OF_CONDITIONS = 9;

const LABELS = Object.freeze({
  save: "Save",
  cancel: "Cancel",
  ruleName: "Rule Name",
  active: "Active",
  addCondition: "Add Condition"
});

const LOGIC_TYPES = Object.freeze({
  always: "Always",
  custom: "Custom",
  and: "AND",
  or: "OR"
});

const RULE_TYPES = Object.freeze({
  autopopulated: "Autopopulated",
  overwritePicklistValues: "Overwrite Picklist Values"
});

const AUTO_POPOULATE_SOURCE_TYPES = Object.freeze({
  raw: "Raw",
  context: "Context"
});

export default class NewQuestionRuleModal extends LightningModal {
  @api formDefinitionId;
  @api questionCatalogId;
  @api questionCatalogName;
  @api questionRuleId;

  @track conditions = [];

  @track rule = {
    Name: "New Rule",
    Active__c: true,
    Logic_Type__c: LOGIC_TYPES.always
  };

  LABELS = LABELS;

  savedCustomLogicValue;

  wiredData;

  @wire(getRule, { questionRuleId: "$questionRuleId" })
  wiredGetRuleData(result) {
    this.wiredData = result;
    const { error, data } = result;
    if (data) {
      this.rule = JSON.parse(JSON.stringify(data));
      this.conditions = data.Rule_Conditions__r || [];
    } else if (error) {
      console.error("Error:", error);
    }
  }

  get computedConditions() {
    return this.conditions.map((condition, index) => ({
      index,
      condition
    }));
  }

  get hasNotReachedMaxNumberOfConditions() {
    return (
      this.isNotAlwaysLogicType &&
      this.conditions.length < MAX_NUMBER_OF_CONDITIONS
    );
  }

  get headerValue() {
    return `${this.questionCatalogName} - ${this.rule.Name}`;
  }

  get isAutopopulateRaw() {
    return (
      this.isRuleTypeAutopopulate &&
      this.rule.Autopopulate_Source_Type__c === AUTO_POPOULATE_SOURCE_TYPES.raw
    );
  }

  get isAutopopulateSourcePath() {
    return (
      this.rule.Autopopulate_Source_Type__c ===
      AUTO_POPOULATE_SOURCE_TYPES.context
    );
  }

  get isCustomLogicType() {
    return this.rule.Logic_Type__c === LOGIC_TYPES.custom;
  }

  get isNotAlwaysLogicType() {
    return this.rule.Logic_Type__c !== LOGIC_TYPES.always;
  }

  get isNotCustomLogicType() {
    return !this.isCustomLogicType;
  }

  get isOverwritePicklistValues() {
    return this.rule.Rule_Type__c === RULE_TYPES.overwritePicklistValues;
  }

  get isRuleTypeAutopopulate() {
    return this.rule.Rule_Type__c === RULE_TYPES.autopopulated;
  }

  get logicTypeField() {
    return this.template.querySelector('[data-id="condition-logic-field"]');
  }

  handleAddCondition() {
    this.conditions = [
      ...this.conditions,
      {
        Source_Type__c: "Answer",
        Operator__c: "Equals"
      }
    ];
    this.validateConditionLogic();
  }

  handleCancel() {
    this.close();
  }

  handleChange(event) {
    const field = event.target.fieldName;
    const value = event.detail.value;
    this.rule[field] = value;

    if (field === "Logic_Type__c") {
      if (value === LOGIC_TYPES.custom) {
        this.rule.Condition_Logic__c = this.savedCustomLogicValue;
        this.validateConditionLogic();
      } else if (value === LOGIC_TYPES.and || value === LOGIC_TYPES.or) {
        this.rule.Condition_Logic__c = Array.from(
          { length: this.conditions.length },
          (_, i) => i + 1
        ).join(` ${value} `);
        this.logicTypeField?.setErrors(null);
      }
    }
    if (field === "Condition_Logic__c") {
      this.savedCustomLogicValue = value;
      this.validateConditionLogic();
    }
  }

  handleDelete(event) {
    this.validateConditionLogic();
    this.conditions = this.conditions.filter(
      (condition, index) => index !== event.detail.index
    );
  }

  handleSave(event) {
    event.preventDefault();

    const { fields } = event.detail;

    if (this.conditions.length) {
      const allConditionsValid = Array.from(
        this.template.querySelectorAll("c-question-rule-condition")
      )
        .map((condition) => condition.validate())
        .every((isValid) => isValid);

      if (!allConditionsValid) {
        return;
      }
    }

    this.template.querySelector("lightning-record-edit-form").submit(fields);
  }

  handleSuccess(event) {
    const savedQuestionRuleId = event.detail.id;

    this.conditions = this.conditions.map((condition, index) => ({
      ...condition,
      Order__c: index + 1,
      Question_Rule__c: savedQuestionRuleId,
      Id: null
    }));

    updateConditions({
      questionRuleId: savedQuestionRuleId,
      conditions: this.conditions
    })
      .then(() => {
        refreshApex(this.wiredData);
        this.close(true);
      })
      .catch((error) => {
        console.error("Error updating conditions:", error);
      });
  }

  handleUpdateCondition(event) {
    const updatedCondition = event.detail.value;

    this.conditions = this.conditions.map((condition, index) => {
      return index === event.detail.index ? updatedCondition : condition;
    });
  }

  validateConditionLogic() {
    if (!this.isCustomLogicType) {
      return;
    }

    const { valid, message } = validateExpression(
      this.rule.Condition_Logic__c,
      this.conditions.length
    );
    if (!valid) {
      this.logicTypeField?.setErrors({
        body: {
          output: {
            fieldErrors: {
              Condition_Logic__c: [
                {
                  message
                }
              ]
            }
          }
        }
      });
    } else {
      this.logicTypeField?.setErrors(null);
    }
  }

  connectedCallback() {
    this.rule = {
      Question_Catalog__c: this.questionCatalogId,
      ...this.rule
    };
  }
}
