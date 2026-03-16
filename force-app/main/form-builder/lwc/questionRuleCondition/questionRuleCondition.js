import getActiveCatalog from "@salesforce/apex/CTSI_QuestionRulesController.getActiveCatalog";
import { LightningElement, api, wire } from "lwc";

const SOURCE_TYPES = Object.freeze({
  Answer: "Answer",
  Context: "Context"
});

const LABELS = Object.freeze({
  resourceType: "Resource Type",
  questionCatalog: "Question Catalog",
  contextPath: "Context Path",
  operator: "Operator",
  not: "Not",
  value: "Value"
});

const OPERATORS = Object.freeze([
  { label: "Equals", value: "Equals" },
  { label: "GreaterThan", value: "GreaterThan" },
  { label: "GreaterOrEqual", value: "GreaterOrEqual" },
  { label: "LessThan", value: "LessThan" },
  { label: "LessOrEqual", value: "LessOrEqual" },
  { label: "Includes", value: "Includes" },
  { label: "IncludesAny", value: "IncludesAny" },
  { label: "IncludesAll", value: "IncludesAll" },
  { label: "Contains", value: "Contains" },
  { label: "StartsWith", value: "StartsWith" },
  { label: "EndsWith", value: "EndsWith" },
  { label: "IsBlank", value: "IsBlank" }
]);

export default class QuestionRuleCondition extends LightningElement {
  @api condition = {};
  @api formDefinitionId;
  @api index;
  @api questionCatalogId;

  @api validate() {
    const inputs = this.template.querySelectorAll(
      "lightning-input, lightning-combobox, lightning-radio-group, lightning-record-picker"
    );

    let isValid = true;

    inputs.forEach((input) => {
      input.reportValidity();

      if (!input.checkValidity()) {
        isValid = false;
      }
    });

    return isValid;
  }

  catalog = [];

  LABELS = LABELS;

  operators = OPERATORS;

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

  @wire(getActiveCatalog, { formDefinitionId: "$formDefinitionId" })
  wiredData({ error, data }) {
    if (data) {
      this.catalog = data
        .filter((catalog) => catalog.Id !== this.questionCatalogId)
        .map((catalog) => ({
          label: catalog.Question__c,
          value: catalog.Id
        }));
    } else if (error) {
      console.error("Error:", error);
    }
  }

  get counter() {
    return this.index + 1;
  }

  get isAnswerType() {
    return this.condition.Source_Type__c === SOURCE_TYPES.Answer;
  }

  handleChange(event) {
    const field = event.target.dataset.field;
    let value = event.detail.value;

    if (field === "Not__c") {
      value = event.detail.checked;
    }

    const updatedCondition = {
      ...this.condition,
      [field]: value
    };

    this.dispatchEvent(
      new CustomEvent("update", {
        detail: {
          value: updatedCondition,
          index: this.index
        }
      })
    );
  }

  handleDelete() {
    this.dispatchEvent(
      new CustomEvent("delete", {
        detail: {
          index: this.index
        }
      })
    );
  }
}
