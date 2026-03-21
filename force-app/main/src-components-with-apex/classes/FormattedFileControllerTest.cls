@IsTest
private class FormattedFileControllerTest {
  static User testUser;

  static void setup() {
    String uniqueUserName =
      'testuser' +
      DateTime.now().getTime() +
      '@testorg.com';
    Profile p = [
      SELECT Id
      FROM Profile
      WHERE Name = 'Standard User' OR Name = 'System Administrator'
      LIMIT 1
    ];
    testUser = new User(
      Alias = 'tuser',
      Email = 'testuser@testorg.com',
      EmailEncodingKey = 'UTF-8',
      LastName = 'Testing',
      LanguageLocaleKey = 'en_US',
      LocaleSidKey = 'en_US',
      ProfileId = p.Id,
      TimeZoneSidKey = 'America/Los_Angeles',
      UserName = uniqueUserName
    );
    insert testUser;
  }

  @IsTest
  static void testGetFiles() {
    setup();
    System.runAs(testUser) {
      // Create test data inline
      Account acc = new Account(Name = 'Test Account');
      insert acc;

      ContentVersion cv = new ContentVersion(
        Title = 'Test File',
        PathOnClient = 'test.pdf',
        VersionData = Blob.valueOf('Test Content'),
        IsMajorVersion = true
      );
      insert cv;

      Id conDocId = [
        SELECT ContentDocumentId
        FROM ContentVersion
        WHERE Id = :cv.Id
      ]
      .ContentDocumentId;

      ContentDocumentLink cdl = new ContentDocumentLink(
        LinkedEntityId = acc.Id,
        ContentDocumentId = conDocId,
        ShareType = 'V'
      );
      insert cdl;

      Test.startTest();
      FormattedFileController.FileWrapper result = FormattedFileController.getFile(
        conDocId
      );
      Test.stopTest();

      Assert.isNotNull(result, 'Expected a file to be returned');
      Assert.areEqual('Test File', result.name, 'File name should match');
      Assert.areEqual(
        'pdf',
        result.extension,
        'Extension should be lowercase pdf'
      );
    }
  }

  @IsTest
  static void testGetFilesNoResults() {
    setup();
    System.runAs(testUser) {
      // Use a non-existent ID by using a valid prefix but random suffix
      String prefix = ContentDocument.SObjectType.getDescribe().getKeyPrefix();
      Id fakeId = Id.valueOf(prefix + '000000000000');

      Test.startTest();
      FormattedFileController.FileWrapper result = FormattedFileController.getFile(
        fakeId
      );
      Test.stopTest();

      Assert.isNull(result, 'Expected null to be returned');
    }
  }
}
