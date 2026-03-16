const ANSWER_TYPES = Object.freeze({
  MULTI_PICKLIST: "Multi-Select Picklist",
  MULTI_CHECKBOX: "Multi-Select Checkbox",
  CHECKBOX: "Checkbox"
});

function groupQuestions(allQuestions) {
  let ungroupedIndex = 0;
  const ungroupedKey = "_ungrouped_";

  const grouped = allQuestions.reduce((acc, item) => {
    const key =
      item.question.Group_By__c || `${ungroupedKey}${ungroupedIndex++}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

  const groups = [];

  for (const [groupKey, questions] of Object.entries(grouped)) {
    const group = {
      groupId: groupKey,
      groupName: !groupKey.includes(ungroupedKey) ? groupKey : null,
      questions
    };

    if (!groupKey.includes(ungroupedKey)) {
      let allNumeric = true;
      const actualSumableQuestions = [];

      for (const questionWrapper of questions) {
        if (questionWrapper.ui.isDisplayText) continue;

        if (
          !["Number", "Currency", "Percentage"].includes(
            questionWrapper.question.Answer_Data_Type__c
          )
        ) {
          allNumeric = false;
          break;
        }

        actualSumableQuestions.push(questionWrapper);
      }

      if (allNumeric && actualSumableQuestions.length) {
        group.shouldShowSum = true;
        group.sumValue = calculateSum(actualSumableQuestions);
      }
    }

    groups.push(group);
  }

  return groups;
}

function calculateSum(questions) {
  let sum = 0;
  let hasCurrency = false;
  let hasPercentage = false;
  let allIntegers = true;

  for (const questionWrapper of questions) {
    if (questionWrapper.ui.isCurrency) hasCurrency = true;
    if (questionWrapper.ui.isPercentage) hasPercentage = true;

    const rawValue = questionWrapper.answer;

    if (rawValue === null || rawValue === undefined || rawValue === "") {
      continue;
    }

    const numericValue = Number(rawValue);

    if (Number.isNaN(numericValue)) {
      continue;
    }

    sum += numericValue;

    if (!Number.isInteger(numericValue)) {
      allIntegers = false;
    }
  }

  if (hasCurrency) {
    return sum.toFixed(2);
  } else if (hasPercentage) {
    return `${sum.toFixed(2)}%`;
  }

  return allIntegers ? Math.round(sum).toString() : sum.toFixed(2);
}

function formatAnswer(type, answerValue) {
  if (
    type === ANSWER_TYPES.MULTI_CHECKBOX ||
    type === ANSWER_TYPES.MULTI_PICKLIST
  ) {
    if (!answerValue || !answerValue.trim().length) {
      return [];
    }
    return answerValue
      .split(";")
      .map((value) => value.trim())
      .filter((value) => value.length);
  } else if (ANSWER_TYPES.CHECKBOX === type) {
    return answerValue === true || answerValue === "true";
  }

  return answerValue || "";
}

function formatPicklistOptions(picklistOptions) {
  if (picklistOptions?.length) {
    return picklistOptions
      .split(";")
      .map((value) => value.trim())
      .filter((value) => value.length)
      .map((trimmedValue) => ({
        label: trimmedValue,
        value: trimmedValue
      }));
  }

  return [];
}

function getAnswerByQuestion(answers) {
  const mapped = {};

  answers.forEach((record) => {
    if (!mapped[record.Question_Catalog__c]) {
      mapped[record.Question_Catalog__c] = record.Answer__c;
    }
  });

  return mapped;
}

function normalizeRulesFromApex(apexRules = []) {
  return apexRules
    .filter((r) => r.Active__c)
    .map((rule) => {
      const normalized = {
        id: rule.Id,
        ruleType: rule.Rule_Type__c,
        logicType: rule.Logic_Type__c || "AND",
        questionId: rule.Question_Catalog__c,
        overwritePicklistValues: rule.Overwrite_Picklist_Values__c,
        conditions: []
      };

      if (rule.Rule_Conditions__r) {
        normalized.conditions = rule.Rule_Conditions__r.map((cond) => ({
          sourceType: cond.Source_Type__c,
          sourcePath: cond.Source_Path__c,
          questionId: cond.Question_Catalog__c,
          operator: cond.Operator__c,
          value: parseValue(cond.Value__c),
          not: cond.Not__c || false
        }));
      }

      if (rule.Rule_Type__c === "Autopopulated") {
        normalized.populateMode =
          rule.Autopopulate_Source_Type__c === "Raw" ? "Raw" : "Context";

        normalized.populateValue = parseValue(rule.Autopopulate_Value_Raw__c);

        normalized.populateSourcePath = rule.Autopopulate_Source_Path__c;
      }

      return normalized;
    });
}

function parseValue(value) {
  if (value === null || value === undefined) return null;

  // Boolean
  if (value === "true") return true;
  if (value === "false") return false;

  // Number
  if (!isNaN(value) && value.trim() !== "") {
    return Number(value);
  }

  // Array (comma separated)
  if (value.includes(",")) {
    return value.split(",").map((v) => v.trim());
  }

  return value;
}

export {
  normalizeRulesFromApex,
  groupQuestions,
  formatAnswer,
  formatPicklistOptions,
  getAnswerByQuestion
};
