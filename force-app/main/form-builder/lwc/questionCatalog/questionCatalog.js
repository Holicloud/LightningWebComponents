import {
  groupQuestions,
  formatAnswer,
  formatPicklistOptions,
  getAnswerByQuestion,
  normalizeRulesFromApex
} from "./helper";

import RuleEngine from "./ruleEngine";

import getCatalogAndAnswers from "@salesforce/apex/CTSI_QuestionCatalogController.getCatalogAndAnswers";

import { ShowToastEvent } from "lightning/platformShowToastEvent";

import { LightningElement, api, track } from "lwc";

const LABELS = Object.freeze({
  saveResponses: "Save Responses",
  noQuestions: "No catalog found for this section.",
  submit: "Submit"
});

const ANSWER_TYPES = Object.freeze({
  CHECKBOX: "Checkbox",
  CURRENCY: "Currency",
  DATE_TIME: "Date Time",
  DATE: "Date",
  DISPLAY_TEXT: "Display Text",
  MULTI_CHECKBOX: "Multi-Select Checkbox",
  MULTI_PICKLIST: "Multi-Select Picklist",
  NUMBER: "Number",
  PERCENTAGE: "Percentage",
  PICKLIST: "Picklist",
  RADIO: "Radio Buttons",
  TEXT_AREA: "Text Area",
  TEXT: "Text"
});

const DEFAULT_COMPONENT_INPUT = "lightning/input";

const INPUT_TYPE_BY_QUESTION_TYPE = Object.freeze({
  [ANSWER_TYPES.CHECKBOX]: {
    type: "checkbox"
  },
  [ANSWER_TYPES.NUMBER]: {
    type: "number"
  },
  [ANSWER_TYPES.CURRENCY]: {
    type: "number",
    formatter: "currency"
  },
  [ANSWER_TYPES.PERCENTAGE]: {
    type: "number",
    formatter: "percent-fixed"
  },
  [ANSWER_TYPES.DATE]: {
    type: "date"
  },
  [ANSWER_TYPES.DATE_TIME]: {
    type: "datetime-local"
  }
});

const COMPONENT_BY_TYPE = Object.freeze({
  [ANSWER_TYPES.TEXT_AREA]: "lightning/textarea",
  [ANSWER_TYPES.RADIO]: "lightning/radioGroup",
  [ANSWER_TYPES.PICKLIST]: "lightning/combobox",
  [ANSWER_TYPES.MULTI_CHECKBOX]: "lightning/checkboxGroup",
  [ANSWER_TYPES.MULTI_PICKLIST]: "lightning/dualListbox"
});

export default class QuestionCatalog extends LightningElement {
  @api editable = false;
  @api formDefinitionId;

  @api formResponseId;
  @api isSubmittable = false;
  @api sections;

  @track answers = {};
  catalog = [];
  context = {};

  firstRender = false;
  isLoading = true;
  LABELS = LABELS;
  ruleEngineResults = {};

  rules = [];

  get allowActions() {
    return this.catalog?.length && this.editable;
  }

  get computedGroupedByQuestions() {
    const result = [];

    for (const question of JSON.parse(JSON.stringify(this.catalog))) {
      const isHidden = this.ruleEngineResults.hidden[question.Id];

      if (isHidden) {
        continue;
      }

      const dataType = question.Answer_Data_Type__c;
      const answer = formatAnswer(dataType, this.answers[question.Id]);
      const isMultiPicklist = dataType === ANSWER_TYPES.MULTI_PICKLIST;

      const singleResult = {
        question,
        answer,
        ui: {
          isHidden: this.ruleEngineResults.hidden[question.Id],
          isDisplayText:
            question.Answer_Data_Type__c === ANSWER_TYPES.DISPLAY_TEXT,
          isCheckbox: question.Answer_Data_Type__c === ANSWER_TYPES.CHECKBOX,
          isCurrency: question.Answer_Data_Type__c === ANSWER_TYPES.CURRENCY,
          isPercentage:
            question.Answer_Data_Type__c === ANSWER_TYPES.PERCENTAGE,
          labelClass: isMultiPicklist
            ? "slds-form-element__label multi-picklist-label"
            : "slds-form-element__label",
          type: COMPONENT_BY_TYPE[dataType] || DEFAULT_COMPONENT_INPUT
        },
        props: INPUT_TYPE_BY_QUESTION_TYPE[dataType] || {}
      };

      singleResult.props.required =
        !!question.Required__c ||
        !!this.ruleEngineResults.required[question.Id];

      singleResult.props.disabled =
        !!this.ruleEngineResults.readOnly[question.Id];

      if (
        [
          ANSWER_TYPES.RADIO,
          ANSWER_TYPES.PICKLIST,
          ANSWER_TYPES.MULTI_CHECKBOX,
          ANSWER_TYPES.MULTI_PICKLIST
        ].includes(dataType)
      ) {
        const options =
          this.ruleEngineResults.overwritePicklistValues?.[question.Id] ||
          question.Picklist_Values__c;

        singleResult.props.options = formatPicklistOptions(options);

        if (dataType === ANSWER_TYPES.MULTI_CHECKBOX && options.length > 10) {
          singleResult.ui.type = "c/multiSelectCheckbox";
        }
      }

      result.push(singleResult);
    }

    return groupQuestions(result);
  }

  get isReadOnly() {
    return !this.editable;
  }

  get sectionList() {
    return this.sections ? this.sections.split(",").map((s) => s.trim()) : [];
  }

  getValue(event) {
    if (event.target.type === "checkbox") {
      return event.target.checked;
    }

    return event.detail.value;
  }

  handleAnswerUpdate(event) {
    const questionId = event.target.dataset.questionId;

    this.answers = {
      ...this.answers,
      [questionId]: this.getValue(event)
    };

    this.ruleEngineResults = new RuleEngine({
      rules: this.rules,
      context: this.context,
      answers: this.answers
    }).evaluateOnChange();
  }

  async initialize() {
    try {
      const { catalog, answers, rules } = await getCatalogAndAnswers({
        formDefinitionId: this.formDefinitionId,
        formResponseId: this.formResponseId,
        sections: this.sections
      });

      if (catalog?.length) {
        this.catalog = catalog;
        this.answers = getAnswerByQuestion(answers);
        this.rules = normalizeRulesFromApex(rules);
      }

      this.ruleEngineResults = new RuleEngine({
        rules: this.rules,
        context: this.context,
        answers: this.answers
      }).evaluateOnLoad();
    } catch (error) {
      const message = error.body?.message || error.message || "Unknown error";
      this.showToast("Error", "Failed to load catalog: " + message, "error");
    } finally {
      this.isLoading = false;
    }
  }

  showToast(title, message, variant) {
    const evt = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant
    });
    this.dispatchEvent(evt);
  }

  connectedCallback() {
    //code
  }

  renderedCallback() {
    if (!this.firstRender) {
      this.firstRender = true;
      this.initialize();
    }
  }
}

export { LABELS };
