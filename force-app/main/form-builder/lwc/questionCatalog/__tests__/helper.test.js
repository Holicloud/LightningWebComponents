import {
  groupQuestions,
  formatAnswer,
  formatPicklistOptions,
  getAnswerByQuestion,
  normalizeRulesFromApex
} from "../helper";

describe("questionCatalog helper", () => {
  describe("formatAnswer", () => {
    it("formats multi-select types into arrays", () => {
      expect(formatAnswer("Multi-Select Picklist", "A;B;C")).toEqual([
        "A",
        "B",
        "C"
      ]);
      expect(formatAnswer("Multi-Select Checkbox", " X ; Y ")).toEqual([
        "X",
        "Y"
      ]);
      expect(formatAnswer("Multi-Select Picklist", "")).toEqual([]);
      expect(formatAnswer("Multi-Select Picklist", null)).toEqual([]);
    });

    it("formats checkbox types into booleans", () => {
      expect(formatAnswer("Checkbox", true)).toBe(true);
      expect(formatAnswer("Checkbox", "true")).toBe(true);
      expect(formatAnswer("Checkbox", false)).toBe(false);
      expect(formatAnswer("Checkbox", "false")).toBe(false);
    });

    it("returns raw value for other types", () => {
      expect(formatAnswer("Text", "Hello")).toBe("Hello");
      expect(formatAnswer("Number", 123)).toBe(123);
    });
  });

  describe("formatPicklistOptions", () => {
    it("converts semicolon-separated string to options array", () => {
      const input = "Red; Blue ; Green";
      const expected = [
        { label: "Red", value: "Red" },
        { label: "Blue", value: "Blue" },
        { label: "Green", value: "Green" }
      ];
      expect(formatPicklistOptions(input)).toEqual(expected);
    });

    it("returns empty array for invalid input", () => {
      expect(formatPicklistOptions(null)).toEqual([]);
      expect(formatPicklistOptions("")).toEqual([]);
    });
  });

  describe("getAnswerByQuestion", () => {
    it("maps answers by question ID", () => {
      const answers = [
        { Question_Catalog__c: "q1", Answer__c: "Ans 1" },
        { Question_Catalog__c: "q2", Answer__c: "Ans 2" }
      ];
      expect(getAnswerByQuestion(answers)).toEqual({
        q1: "Ans 1",
        q2: "Ans 2"
      });
    });
  });

  describe("groupQuestions", () => {
    it("groups questions by Group_By__c field", () => {
      const questions = [
        { question: { Id: "1", Group_By__c: "Group A" }, ui: {} },
        { question: { Id: "2", Group_By__c: "Group A" }, ui: {} },
        { question: { Id: "3", Group_By__c: null }, ui: {} }
      ];
      const groups = groupQuestions(questions);
      expect(groups.length).toBe(2);
      expect(groups[0].groupName).toBe("Group A");
      expect(groups[0].questions.length).toBe(2);
    });

    it("calculates sums for numeric groups", () => {
      const questions = [
        {
          question: {
            Id: "1",
            Group_By__c: "SumGroup",
            Answer_Data_Type__c: "Number"
          },
          ui: {},
          answer: 10
        },
        {
          question: {
            Id: "2",
            Group_By__c: "SumGroup",
            Answer_Data_Type__c: "Number"
          },
          ui: {},
          answer: 20
        }
      ];
      const groups = groupQuestions(questions);
      expect(groups[0].shouldShowSum).toBe(true);
      expect(groups[0].sumValue).toBe("30");
    });
  });

  describe("normalizeRulesFromApex", () => {
    it("normalizes Apex rules into engine-ready format", () => {
      const apexRules = [
        {
          Id: "r1",
          Active__c: true,
          Rule_Type__c: "Autopopulated",
          Logic_Type__c: "AND",
          Question_Catalog__c: "q1",
          Autopopulate_Source_Type__c: "Raw",
          Autopopulate_Value_Raw__c: "100",
          Rule_Conditions__r: [
            {
              Source_Type__c: "Answer",
              Question_Catalog__c: "q2",
              Operator__c: "Equals",
              Value__c: "Yes"
            }
          ]
        },
        {
          Id: "r2",
          Active__c: false // Should be filtered out
        }
      ];

      const normalized = normalizeRulesFromApex(apexRules);
      expect(normalized.length).toBe(1);
      expect(normalized[0].id).toBe("r1");
      expect(normalized[0].populateValue).toBe(100);
      expect(normalized[0].conditions[0].value).toBe("Yes");
    });
  });
});
