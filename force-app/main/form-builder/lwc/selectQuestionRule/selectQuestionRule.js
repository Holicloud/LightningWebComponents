import { refreshApex } from "@salesforce/apex";
import activate from "@salesforce/apex/CTSI_QuestionRulesController.activate";
import deactivate from "@salesforce/apex/CTSI_QuestionRulesController.deactivate";
import deleteRule from "@salesforce/apex/CTSI_QuestionRulesController.deleteRule";
import getActiveCatalog from "@salesforce/apex/CTSI_QuestionRulesController.getActiveCatalog";
import getRulesByFormDefinition from "@salesforce/apex/CTSI_QuestionRulesController.getRulesByFormDefinition";
import NewQuestionRuleModal from "c/newQuestionRuleModal";
import { LightningElement, api, wire, track } from "lwc";

const ALL_QUESTIONS_VALUE = "__ALL__";

const LOGICAL_OPTONS = Object.freeze({
  AND: "All Conditions Are Met (AND)",
  OR: "Any Condition Is Met (OR)",
  Custom: "Custom Condition Logic Is Met",
  Always: "Always"
});

const LABELS = Object.freeze({
  filterByQuestion: "Filter by Question",
  allQuestions: "All Questions",
  showInactive: "Show Inactive",
  addRule: "Add Rule",
  editRule: "Edit",
  deactivateRule: "Deactivate",
  activateRule: "Activate",
  deleteRule: "Delete",
  noRulesFound: "No rules defined for this form"
});

export default class SelectQuestionRule extends LightningElement {
  @api recordId;

  @track allRules = [];

  catalog = [];
  LABELS = LABELS;
  selectedQuestion = ALL_QUESTIONS_VALUE;

  showInactive = true;
  wiredAllRules;

  @wire(getRulesByFormDefinition, { formDefinitionId: "$recordId" })
  handleGetAllRules(result) {
    this.wiredAllRules = result;
    const { error, data } = result;
    if (data) {
      this.allRules = data;
    } else if (error) {
      console.error("Error loading rules:", error);
    }
  }

  @wire(getActiveCatalog, { formDefinitionId: "$recordId" })
  wiredCatalog({ error, data }) {
    if (data) {
      this.catalog = data.map((q) => ({
        label: q.Question__c,
        value: q.Id
      }));
    } else if (error) {
      console.error("Error loading catalog:", error);
    }
  }

  get addRuleQuestionCatalogId() {
    return this.selectedQuestion !== ALL_QUESTIONS_VALUE
      ? this.selectedQuestion
      : null;
  }

  get groupedRules() {
    let result = JSON.parse(JSON.stringify(this.allRules));

    // Filter by selected question
    if (this.selectedQuestion !== ALL_QUESTIONS_VALUE) {
      result = result.filter(
        (rule) => rule.Question_Catalog__c === this.selectedQuestion
      );
    }

    // Filter by active
    if (!this.showInactive) {
      result = result.filter((rule) => rule.Active__c === true);
    }

    const processedRules = result.map((rule) => {
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
          logicType:
            rule.Logic_Type__c === "Custom"
              ? `Custom Condition Match (${rule.Condition_Logic__c})`
              : LOGICAL_OPTONS[rule.Logic_Type__c] || "",
          questionName: rule.Question_Catalog__r?.Question__c || ""
        },
        ...rule
      };
    });

    const groupsMap = new Map();
    processedRules.forEach((rule) => {
      const qId = rule.Question_Catalog__c;
      if (!groupsMap.has(qId)) {
        groupsMap.set(qId, {
          questionId: qId,
          questionName: rule.ui.questionName,
          rules: []
        });
      }
      groupsMap.get(qId).rules.push(rule);
    });

    return Array.from(groupsMap.values());
  }

  get hasRules() {
    return this.groupedRules.length > 0;
  }

  get questionFilterOptions() {
    return [
      { label: LABELS.allQuestions, value: ALL_QUESTIONS_VALUE },
      ...this.catalog
    ];
  }

  async handleActivateRule(event) {
    await activate({
      questionRuleId: event.target.dataset.ruleId
    });
    refreshApex(this.wiredAllRules);
  }

  async handleAddRule() {
    await NewQuestionRuleModal.open({
      label: "Add Rule",
      questionCatalogId: this.addRuleQuestionCatalogId,
      formDefinitionId: this.recordId
    });
    refreshApex(this.wiredAllRules);
  }

  async handleDeactivateRule(event) {
    await deactivate({
      questionRuleId: event.target.dataset.ruleId
    });
    refreshApex(this.wiredAllRules);
  }

  async handleDeleteRule(event) {
    await deleteRule({ questionRuleId: event.target.dataset.ruleId });
    refreshApex(this.wiredAllRules);
  }

  async handleEditRule(event) {
    const questionRuleId = event.target.dataset.ruleId;
    const questionCatalogId = event.target.dataset.catalogId;
    const result = await NewQuestionRuleModal.open({
      label: "Edit Rule",
      questionRuleId,
      questionCatalogId,
      formDefinitionId: this.recordId
    });
    if (result) {
      refreshApex(this.wiredAllRules);
    }
  }

  handleQuestionFilterChange(event) {
    this.selectedQuestion = event.detail.value;
  }

  toggleShowInactive() {
    this.showInactive = !this.showInactive;
  }
}
