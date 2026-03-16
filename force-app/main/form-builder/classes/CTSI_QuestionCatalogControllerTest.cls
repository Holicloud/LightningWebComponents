@IsTest
private class CTSI_QuestionCatalogControllerTest {
  private static final String TEST_USER_NAME_PREFIX = 'standarduser_catalog_test';

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

      Form_Response__c fr = new Form_Response__c(Form_Definition__c = fd.Id);
      insert fr;

      Question_Answer__c qa = new Question_Answer__c(
        Form_Response__c = fr.Id,
        Question_Catalog__c = qc1.Id,
        Answer__c = 'Answer 1'
      );
      insert qa;

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
  static void testGetCatalogAndAnswers() {
    setupData();
    User standarduser = getStandardUser();

    System.runAs(standarduser) {
      Form_Definition__c fd = [SELECT Id FROM Form_Definition__c LIMIT 1];
      Form_Response__c fr = [SELECT Id FROM Form_Response__c LIMIT 1];

      Test.startTest();
      CTSI_QuestionCatalogController.Response response = CTSI_QuestionCatalogController.getCatalogAndAnswers(
        fd.Id,
        fr.Id,
        new List<String>{ 'Section 1' }
      );
      Test.stopTest();

      Assert.isNotNull(response, 'Response should not be null');
      Assert.areEqual(2, response.catalog.size(), 'Should return 2 questions');
      Assert.areEqual(1, response.answers.size(), 'Should return 1 answer');
      Assert.areEqual(1, response.rules.size(), 'Should return 1 rule');
      Assert.areEqual(
        1,
        response.rules[0].Rule_Conditions__r.size(),
        'Rule should have 1 condition'
      );
    }
  }

  @IsTest
  static void testGetCatalogAndAnswersNoSections() {
    setupData();
    User standarduser = getStandardUser();

    System.runAs(standarduser) {
      Form_Definition__c fd = [SELECT Id FROM Form_Definition__c LIMIT 1];
      Form_Response__c fr = [SELECT Id FROM Form_Response__c LIMIT 1];

      Test.startTest();
      CTSI_QuestionCatalogController.Response response = CTSI_QuestionCatalogController.getCatalogAndAnswers(
        fd.Id,
        fr.Id,
        new List<String>()
      );
      Test.stopTest();

      Assert.isNotNull(response, 'Response should not be null');
      Assert.areEqual(2, response.catalog.size(), 'Should return 2 questions');
    }
  }

  @IsTest
  static void testGetCatalogAndAnswersNullId() {
    setupData();
    User standarduser = getStandardUser();

    System.runAs(standarduser) {
      Test.startTest();
      CTSI_QuestionCatalogController.Response response = CTSI_QuestionCatalogController.getCatalogAndAnswers(
        null,
        null,
        new List<String>()
      );
      Test.stopTest();

      Assert.isNotNull(response, 'Response should not be null');
      Assert.isNull(
        response.catalog,
        'Catalog should be null when formDefinitionId is null'
      );
    }
  }
}
