import RuleEngine from "../ruleEngine";

describe("RuleEngine", () => {
  it("evaluates simple equality rule correctly", () => {
    const rules = [
      {
        questionId: "q2",
        ruleType: "Hidden",
        conditions: [
          {
            sourceType: "Answer",
            questionId: "q1",
            operator: "Equals",
            value: "Yes"
          }
        ]
      }
    ];
    const answers = { q1: "Yes" };
    const engine = new RuleEngine({ rules, answers });
    const result = engine.evaluateAll();

    expect(result.hidden.q2).toBe(true);
  });

  it("evaluates simple inequality rule correctly", () => {
    const rules = [
      {
        questionId: "q2",
        ruleType: "Hidden",
        conditions: [
          {
            sourceType: "Answer",
            questionId: "q1",
            operator: "Equals",
            value: "Yes"
          }
        ]
      }
    ];
    const answers = { q1: "No" };
    const engine = new RuleEngine({ rules, answers });
    const result = engine.evaluateAll();

    expect(result.hidden.q2).toBe(false);
  });

  it("applies autopopulate correctly", () => {
    const rules = [
      {
        questionId: "q1",
        ruleType: "Autopopulated",
        populateMode: "Raw",
        populateValue: "Pre-filled",
        conditions: [] // Always
      }
    ];
    const answers = {};
    const engine = new RuleEngine({ rules, answers });
    engine.evaluateOnLoad();

    expect(answers.q1).toBe("Pre-filled");
  });

  it("does not override existing answer in autopopulate", () => {
    const rules = [
      {
        questionId: "q1",
        ruleType: "Autopopulated",
        populateMode: "Raw",
        populateValue: "Pre-filled",
        conditions: []
      }
    ];
    const answers = { q1: "User Answer" };
    const engine = new RuleEngine({ rules, answers });
    engine.evaluateOnLoad();

    expect(answers.q1).toBe("User Answer");
  });

  it("resolves context path correctly", () => {
    const rules = [
      {
        questionId: "q1",
        ruleType: "Autopopulated",
        populateMode: "Context",
        populateSourcePath: "user.name",
        conditions: []
      }
    ];
    const context = { user: { name: "John Doe" } };
    const answers = {};
    const engine = new RuleEngine({ rules, context, answers });
    engine.evaluateOnLoad();

    expect(answers.q1).toBe("John Doe");
  });

  it("handles complex boolean logic", () => {
    // Mocking evaluateExpression is needed if we don't want to depend on c/booleanExpressionEngine
    // But since it's a real import, it should work in Jest if that component exists.
    // Assuming c/booleanExpressionEngine is available.
    const rules = [
      {
        questionId: "q3",
        ruleType: "Hidden",
        conditionLogic: "1 OR 2",
        conditions: [
          {
            sourceType: "Answer",
            questionId: "q1",
            operator: "Equals",
            value: "A"
          },
          {
            sourceType: "Answer",
            questionId: "q2",
            operator: "Equals",
            value: "B"
          }
        ]
      }
    ];

    expect(
      new RuleEngine({ rules, answers: { q1: "A", q2: "X" } }).evaluateAll()
        .hidden.q3
    ).toBe(true);
    expect(
      new RuleEngine({ rules, answers: { q1: "X", q2: "B" } }).evaluateAll()
        .hidden.q3
    ).toBe(true);
    expect(
      new RuleEngine({ rules, answers: { q1: "X", q2: "X" } }).evaluateAll()
        .hidden.q3
    ).toBe(false);
  });

  describe("logic and operators", () => {
    it("handles fallback logicType OR", () => {
      const rules = [
        {
          questionId: "q3",
          ruleType: "Hidden",
          logicType: "OR",
          conditions: [
            {
              sourceType: "Answer",
              questionId: "q1",
              operator: "Equals",
              value: "A"
            },
            {
              sourceType: "Answer",
              questionId: "q2",
              operator: "Equals",
              value: "B"
            }
          ]
        }
      ];
      expect(
        new RuleEngine({ rules, answers: { q1: "A", q2: "X" } }).evaluateAll()
          .hidden.q3
      ).toBe(true);
      expect(
        new RuleEngine({ rules, answers: { q1: "X", q2: "B" } }).evaluateAll()
          .hidden.q3
      ).toBe(true);
      expect(
        new RuleEngine({ rules, answers: { q1: "X", q2: "X" } }).evaluateAll()
          .hidden.q3
      ).toBe(false);
    });

    it("handles negation (NOT)", () => {
      const rules = [
        {
          questionId: "q2",
          ruleType: "Hidden",
          conditions: [
            {
              sourceType: "Answer",
              questionId: "q1",
              operator: "Equals",
              value: "Yes",
              not: true
            }
          ]
        }
      ];
      expect(
        new RuleEngine({ rules, answers: { q1: "No" } }).evaluateAll().hidden.q2
      ).toBe(true);
      expect(
        new RuleEngine({ rules, answers: { q1: "Yes" } }).evaluateAll().hidden
          .q2
      ).toBe(false);
    });

    it("evaluates context-based conditions", () => {
      const rules = [
        {
          questionId: "q1",
          ruleType: "Required",
          conditions: [
            {
              sourceType: "Context",
              sourcePath: "form.isPremium",
              operator: "Equals",
              value: true
            }
          ]
        }
      ];
      const context = { form: { isPremium: true } };
      expect(new RuleEngine({ rules, context }).evaluateAll().required.q1).toBe(
        true
      );
    });

    it("handles numeric operators", () => {
      const condition = (op, val) => ({
        questionId: "target",
        ruleType: "ReadOnly",
        conditions: [
          { sourceType: "Answer", questionId: "q1", operator: op, value: val }
        ]
      });

      expect(
        new RuleEngine({
          rules: [condition("GreaterThan", 10)],
          answers: { q1: 15 }
        }).evaluateAll().readOnly.target
      ).toBe(true);
      expect(
        new RuleEngine({
          rules: [condition("GreaterOrEqual", 10)],
          answers: { q1: 10 }
        }).evaluateAll().readOnly.target
      ).toBe(true);
      expect(
        new RuleEngine({
          rules: [condition("LessThan", 10)],
          answers: { q1: 5 }
        }).evaluateAll().readOnly.target
      ).toBe(true);
      expect(
        new RuleEngine({
          rules: [condition("LessOrEqual", 10)],
          answers: { q1: 10 }
        }).evaluateAll().readOnly.target
      ).toBe(true);
    });

    it("handles string and collection operators", () => {
      const condition = (op, val) => ({
        questionId: "target",
        ruleType: "Hidden",
        conditions: [
          { sourceType: "Answer", questionId: "q1", operator: op, value: val }
        ]
      });

      expect(
        new RuleEngine({
          rules: [condition("Contains", "apple")],
          answers: { q1: "pineapple" }
        }).evaluateAll().hidden.target
      ).toBe(true);
      expect(
        new RuleEngine({
          rules: [condition("StartsWith", "Sales")],
          answers: { q1: "Salesforce" }
        }).evaluateAll().hidden.target
      ).toBe(true);
      expect(
        new RuleEngine({
          rules: [condition("EndsWith", "force")],
          answers: { q1: "Salesforce" }
        }).evaluateAll().hidden.target
      ).toBe(true);
      expect(
        new RuleEngine({
          rules: [condition("IsBlank", null)],
          answers: { q1: "" }
        }).evaluateAll().hidden.target
      ).toBe(true);
      expect(
        new RuleEngine({
          rules: [condition("IsBlank", null)],
          answers: { q1: [] }
        }).evaluateAll().hidden.target
      ).toBe(true);
      expect(
        new RuleEngine({
          rules: [condition("Includes", "A")],
          answers: { q1: ["A", "B"] }
        }).evaluateAll().hidden.target
      ).toBe(true);
      expect(
        new RuleEngine({
          rules: [condition("IncludesAny", ["A", "C"])],
          answers: { q1: ["A", "B"] }
        }).evaluateAll().hidden.target
      ).toBe(true);
      expect(
        new RuleEngine({
          rules: [condition("IncludesAll", ["A", "B"])],
          answers: { q1: ["A", "B"] }
        }).evaluateAll().hidden.target
      ).toBe(true);
    });

    it("warns on unsupported operator", () => {
      const rules = [
        {
          questionId: "q1",
          ruleType: "Hidden",
          conditions: [
            {
              sourceType: "Answer",
              questionId: "q1",
              operator: "InvalidOp",
              value: "X"
            }
          ]
        }
      ];
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
      const result = new RuleEngine({
        rules,
        answers: { q1: "X" }
      }).evaluateAll();
      expect(result.hidden.q1).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Unsupported operator")
      );
      consoleSpy.mockRestore();
    });
  });

  describe("special rule types", () => {
    it("handles Overwrite Picklist Values", () => {
      const rules = [
        {
          questionId: "q1",
          ruleType: "Overwrite Picklist Values",
          overwritePicklistValues: "A;B;C",
          conditions: [
            {
              sourceType: "Answer",
              questionId: "q2",
              operator: "Equals",
              value: "ShowAll"
            }
          ]
        }
      ];
      const result = new RuleEngine({
        rules,
        answers: { q2: "ShowAll" }
      }).evaluateAll();
      expect(result.overwritePicklistValues.q1).toBe("A;B;C");
    });

    it("last match wins for Overwrite Picklist Values", () => {
      const rules = [
        {
          questionId: "q1",
          ruleType: "Overwrite Picklist Values",
          overwritePicklistValues: "A",
          conditions: []
        },
        {
          questionId: "q1",
          ruleType: "Overwrite Picklist Values",
          overwritePicklistValues: "B",
          conditions: []
        }
      ];
      const result = new RuleEngine({ rules }).evaluateAll();
      expect(result.overwritePicklistValues.q1).toBe("B");
    });
  });
});
