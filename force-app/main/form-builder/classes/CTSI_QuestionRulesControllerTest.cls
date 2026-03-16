@IsTest
private class CTSI_QuestionRulesControllerTest {
  private static final String TEST_USER_NAME_PREFIX = 'standarduser_rules_test';

  @TestSetup
  static void setup() {
    createStandardUser();
  }

  private static void setupData() {
    System.runAs(getStandardUser()) {
      Form_Definition__c fd = new Form_Definition__c(Name = 'Test Form');
      insert fd;

      Form_Section__c fs = new Form_Section__c(
        Name = 'Section 1',
        Form_Definition__c = fd.Id
      );
      insert fs;

      Question_Catalog__c qc1 = new Question_Catalog__c(
        Form_Definition__c = fd.Id,
        Form_Section__c = fs.Id,
        Question__c = 'Question 1',
        Order__c = 1,
        Active__c = true
      );
      Question_Catalog__c qc2 = new Question_Catalog__c(
        Form_Definition__c = fd.Id,
        Form_Section__c = fs.Id,
        Question__c = 'Question 2',
        Order__c = 2,
        Active__c = true
      );
      insert new List<Question_Catalog__c>{ qc1, qc2 };

      Question_Rule__c qr = new Question_Rule__c(
        Question_Catalog__c = qc2.Id,
        Rule_Type__c = 'Hidden',
        Logic_Type__c = 'AND',
        Active__c = true
      );
      insert qr;

      Rule_Condition__c rc = new Rule_Condition__c(
        Question_Rule__c = qr.Id,
        Question_Catalog__c = qc1.Id,
        Operator__c = 'Equals',
        Value__c = 'Answer 1',
        Order__c = 1
      );
      insert rc;
    }
  }

  private static User createStandardUser() {
    String uniqueUserName =
      TEST_USER_NAME_PREFIX +
      DateTime.now().getTime() +
      '@testorg.com';
    Profile standardProfile = [
      SELECT Id
      FROM Profile
      WHERE Name = 'System Administrator'
    ];
    User u = new User(
      Alias = 'standt',
      Email = 'standarduser@testorg.com',
      EmailEncodingKey = 'UTF-8',
      LastName = 'Testing',
      LanguageLocaleKey = 'en_US',
      LocaleSidKey = 'en_US',
      ProfileId = standardProfile.Id,
      TimeZoneSidKey = 'America/Los_Angeles',
      UserName = uniqueUserName
    );
    insert u;

    PermissionSet ps = [
      SELECT Id
      FROM PermissionSet
      WHERE Name = 'Form_Builder_Edit_Forms'
    ];
    insert new PermissionSetAssignment(
      AssigneeId = u.Id,
      PermissionSetId = ps.Id
    );

    return u;
  }

  private static User getStandardUser() {
    return [
      SELECT Id
      FROM User
      WHERE UserName LIKE :TEST_USER_NAME_PREFIX + '%'
      LIMIT 1
    ];
  }

  @IsTest
  static void testGetRules() {
    setupData();
    User standarduser = getStandardUser();

    System.runAs(standarduser) {
      Question_Catalog__c qc = [
        SELECT Id
        FROM Question_Catalog__c
        WHERE Order__c = 2
        LIMIT 1
      ];

      Test.startTest();
      List<Question_Rule__c> rules = CTSI_QuestionRulesController.getRules(
        qc.Id
      );
      Test.stopTest();

      Assert.isNotNull(rules, 'Rules list should not be null');
      Assert.areEqual(1, rules.size(), 'Should return 1 rule');
      Assert.areEqual(
        1,
        rules[0].Rule_Conditions__r.size(),
        'Rule should have 1 condition'
      );
    }
  }

  @IsTest
  static void testGetRule() {
    setupData();
    User standarduser = getStandardUser();

    System.runAs(standarduser) {
      Question_Rule__c qr = [SELECT Id FROM Question_Rule__c LIMIT 1];

      Test.startTest();
      Question_Rule__c rule = CTSI_QuestionRulesController.getRule(qr.Id);
      Test.stopTest();

      Assert.isNotNull(rule, 'Should return the rule');
      Assert.areEqual(
        1,
        rule.Rule_Conditions__r.size(),
        'Rule should have 1 condition'
      );
    }
  }

  @IsTest
  static void testUpdateConditions() {
    setupData();
    User standarduser = getStandardUser();

    System.runAs(standarduser) {
      Question_Rule__c qr = [SELECT Id FROM Question_Rule__c LIMIT 1];
      Question_Catalog__c qc1 = [
        SELECT Id
        FROM Question_Catalog__c
        WHERE Order__c = 1
        LIMIT 1
      ];

      Rule_Condition__c newCondition = new Rule_Condition__c(
        Question_Rule__c = qr.Id,
        Question_Catalog__c = qc1.Id,
        Operator__c = 'GreaterThan',
        Value__c = '1',
        Order__c = 1
      );

      Test.startTest();
      CTSI_QuestionRulesController.updateConditions(
        qr.Id,
        new List<Rule_Condition__c>{ newCondition }
      );
      Test.stopTest();

      List<Rule_Condition__c> conditions = [
        SELECT Id, Operator__c
        FROM Rule_Condition__c
        WHERE Question_Rule__c = :qr.Id
      ];
      Assert.areEqual(
        1,
        conditions.size(),
        'Should have 1 condition after update'
      );
      Assert.areEqual(
        'GreaterThan',
        conditions[0].Operator__c,
        'Operator should be updated'
      );
    }
  }

  @IsTest
  static void testActivate() {
    setupData();
    User standarduser = getStandardUser();

    System.runAs(standarduser) {
      Question_Rule__c qr = [
        SELECT Id, Active__c
        FROM Question_Rule__c
        LIMIT 1
      ];
      // Force it to false first
      qr.Active__c = false;
      update qr;

      Test.startTest();
      CTSI_QuestionRulesController.activate(qr.Id);
      Test.stopTest();

      qr = [SELECT Id, Active__c FROM Question_Rule__c WHERE Id = :qr.Id];
      Assert.isTrue(qr.Active__c, 'Active status should be true');
    }
  }

  @IsTest
  static void testDeactivate() {
    setupData();
    User standarduser = getStandardUser();

    System.runAs(standarduser) {
      Question_Rule__c qr = [
        SELECT Id, Active__c
        FROM Question_Rule__c
        LIMIT 1
      ];
      Assert.isTrue(qr.Active__c, 'Rule should be active initially');

      Test.startTest();
      CTSI_QuestionRulesController.deactivate(qr.Id);
      Test.stopTest();

      qr = [SELECT Id, Active__c FROM Question_Rule__c WHERE Id = :qr.Id];
      Assert.isFalse(qr.Active__c, 'Active status should be false');
    }
  }

  @IsTest
  static void testDeleteRule() {
    setupData();
    User standarduser = getStandardUser();

    System.runAs(standarduser) {
      Question_Rule__c qr = [SELECT Id FROM Question_Rule__c LIMIT 1];

      Test.startTest();
      CTSI_QuestionRulesController.deleteRule(qr.Id);
      Test.stopTest();

      List<Question_Rule__c> rules = [
        SELECT Id
        FROM Question_Rule__c
        WHERE Id = :qr.Id
      ];
      Assert.areEqual(0, rules.size(), 'Rule should be deleted');

      List<Rule_Condition__c> conditions = [
        SELECT Id
        FROM Rule_Condition__c
        WHERE Question_Rule__c = :qr.Id
      ];
      Assert.areEqual(0, conditions.size(), 'Conditions should be deleted');
    }
  }

  @IsTest
  static void testGetRulesByFormDefinition() {
    setupData();
    User standarduser = getStandardUser();

    System.runAs(standarduser) {
      Form_Definition__c fd = [SELECT Id FROM Form_Definition__c LIMIT 1];

      Test.startTest();
      List<Question_Rule__c> rules = CTSI_QuestionRulesController.getRulesByFormDefinition(
        fd.Id
      );
      Test.stopTest();

      Assert.isNotNull(rules, 'Rules should not be null');
      Assert.areEqual(
        1,
        rules.size(),
        'Should return 1 rule for the form definition'
      );
    }
  }

  @IsTest
  static void testGetActiveCatalog() {
    setupData();
    User standarduser = getStandardUser();

    System.runAs(standarduser) {
      Form_Definition__c fd = [SELECT Id FROM Form_Definition__c LIMIT 1];

      Test.startTest();
      List<Question_Catalog__c> catalog = CTSI_QuestionRulesController.getActiveCatalog(
        fd.Id
      );
      Test.stopTest();

      Assert.isNotNull(catalog, 'Catalog should not be null');
      Assert.areEqual(
        2,
        catalog.size(),
        'Should return 2 active catalog items'
      );
    }
  }
}
