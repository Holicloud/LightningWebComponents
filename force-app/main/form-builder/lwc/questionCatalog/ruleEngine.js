import { evaluateExpression } from "c/booleanExpressionEngine";

// ruleEngine.js

// ==============================
// OPERATOR MAP
// ==============================

const operators = {
  Equals: (a, b) => a === b,

  GreaterThan: (a, b) => Number(a) > Number(b),
  GreaterOrEqual: (a, b) => Number(a) >= Number(b),
  LessThan: (a, b) => Number(a) < Number(b),
  LessOrEqual: (a, b) => Number(a) <= Number(b),

  Contains: (a, b) => typeof a === "string" && a.includes(b),

  StartsWith: (a, b) => typeof a === "string" && a.startsWith(b),

  EndsWith: (a, b) => typeof a === "string" && a.endsWith(b),

  IsBlank: (a) =>
    a === null ||
    a === undefined ||
    a === "" ||
    (Array.isArray(a) && a.length === 0),

  Includes: (a, b) => Array.isArray(a) && a.includes(b),

  IncludesAny: (a, b) =>
    Array.isArray(a) && Array.isArray(b) && b.some((val) => a.includes(val)),

  IncludesAll: (a, b) =>
    Array.isArray(a) && Array.isArray(b) && b.every((val) => a.includes(val))
};

export default class RuleEngine {
  applyAutopopulate() {
    this.rules
      .filter((r) => r.ruleType === "Autopopulated")
      .forEach((rule) => {
        const shouldRun = this.evaluateRule(rule);

        if (!shouldRun) return;

        const target = rule.questionId;

        // Do NOT override user input
        if (
          this.answers[target] !== undefined &&
          this.answers[target] !== null &&
          this.answers[target] !== ""
        ) {
          return;
        }

        if (rule.populateMode === "Raw") {
          this.answers[target] = rule.populateValue;
        }

        if (rule.populateMode === "Context") {
          this.answers[target] = this.resolvePath(
            this.context,
            rule.populateSourcePath
          );
        }
      });
  }

  // ==============================
  // CORE EVALUATION
  // ==============================

  evaluateAll() {
    const result = {
      hidden: {},
      required: {},
      readOnly: {},
      overwritePicklistValues: {}
    };

    const grouped = this.groupByTypeAndQuestion();

    Object.values(grouped).forEach(({ ruleType, questionId, rules }) => {
      const evaluations = rules.map((rule) => this.evaluateRule(rule));

      switch (ruleType) {
        case "Hidden":
          result.hidden[questionId] = evaluations.some(Boolean);
          break;

        case "Required":
          result.required[questionId] = evaluations.some(Boolean);
          break;

        case "ReadOnly":
          result.readOnly[questionId] = evaluations.some(Boolean);
          break;

        case "Overwrite Picklist Values": {
          let selectedValues;

          for (const rule of rules) {
            if (this.evaluateRule(rule)) {
              selectedValues = rule.overwritePicklistValues; // last match wins
            }
          }

          if (selectedValues) {
            result.overwritePicklistValues[questionId] = selectedValues;
          }

          break;
        }

        default:
          break;
      }
    });

    return result;
  }

  evaluateCondition(condition) {
    const actual = this.resolveValue(condition);
    const expected = condition.value;

    const operatorFn = operators[condition.operator];

    if (!operatorFn) {
      console.warn(`Unsupported operator: ${condition.operator}`);
      return false;
    }

    const result = operatorFn(actual, expected);

    return condition.not ? !result : result;
  }

  evaluateOnChange() {
    // Future: dependency index optimization
    return this.evaluateAll();
  }

  // ==============================
  // PUBLIC API
  // ==============================

  evaluateOnLoad() {
    this.applyAutopopulate();
    return this.evaluateAll();
  }

  // ==============================
  // RULE EVALUATION
  // ==============================

  evaluateRule(rule) {
    if (!rule.conditions || rule.conditions.length === 0) {
      return true; // Always
    }

    const conditionResults = rule.conditions.map((condition) =>
      this.evaluateCondition(condition)
    );

    // Advanced boolean expression support (e.g., "1 AND (2 OR 3)")
    if (rule.conditionLogic && rule.conditionLogic.trim() !== "") {
      return evaluateExpression(conditionResults, rule.conditionLogic);
    }

    // Fallback simple AND/OR
    if (rule.logicType === "OR") {
      return conditionResults.some(Boolean);
    }

    return conditionResults.every(Boolean);
  }

  groupByTypeAndQuestion() {
    const map = {};

    this.rules.forEach((rule) => {
      if (rule.ruleType === "Autopopulated") return;

      const key = `${rule.ruleType}-${rule.questionId}`;

      if (!map[key]) {
        map[key] = {
          ruleType: rule.ruleType,
          questionId: rule.questionId,
          rules: []
        };
      }

      map[key].rules.push(rule);
    });

    return map;
  }

  resolvePath(obj, path) {
    if (!obj || !path) return null;

    return path.split(".").reduce((acc, part) => acc?.[part], obj);
  }

  // ==============================
  // VALUE RESOLUTION
  // ==============================

  resolveValue(condition) {
    if (condition.sourceType === "Answer") {
      return this.answers[condition.questionId];
    }

    if (condition.sourceType === "Context") {
      return this.resolvePath(this.context, condition.sourcePath);
    }

    return null;
  }

  constructor({ rules, context, answers }) {
    this.rules = rules || [];
    this.context = context || {};
    this.answers = answers || {};
  }
}
