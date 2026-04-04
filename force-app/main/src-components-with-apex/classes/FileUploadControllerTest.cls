@IsTest
private class FileUploadControllerTest {
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
  static void testGetFileWithContentDocument() {
    setup();
    System.runAs(testUser) {
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
      FileUploadController.FileWrapper result = FileUploadController.getFile(
        conDocId
      );
      Test.stopTest();

      Assert.isNotNull(result, 'Expected a file to be returned for CD');
      Assert.areEqual('Test File', result.name, 'File name should match');
      Assert.areEqual(
        'pdf',
        result.extension,
        'Extension should be lowercase pdf'
      );
    }
  }

  @IsTest
  static void testGetFileWithContentDocumentLink() {
    setup();
    System.runAs(testUser) {
      Account acc = new Account(Name = 'Test Account');
      insert acc;

      ContentVersion cv = new ContentVersion(
        Title = 'CDL Test',
        PathOnClient = 'test.docx',
        VersionData = Blob.valueOf('CDL Content'),
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
      FileUploadController.FileWrapper result = FileUploadController.getFile(
        cdl.Id
      );
      Test.stopTest();

      Assert.isNotNull(result, 'Expected a file to be returned for CDL');
      Assert.areEqual('CDL Test', result.name, 'File name should match');
    }
  }

  @IsTest
  static void testGetFileNoResults() {
    setup();
    System.runAs(testUser) {
      String prefix = ContentDocument.SObjectType.getDescribe(
          SObjectDescribeOptions.DEFERRED
        )
        .getKeyPrefix();
      Id fakeId = Id.valueOf(prefix + '000000000000');

      Test.startTest();
      FileUploadController.FileWrapper result = FileUploadController.getFile(
        fakeId
      );
      Test.stopTest();

      Assert.isNull(result, 'Expected null to be returned');
    }
  }

  @IsTest
  static void testGetFileNullId() {
    setup();
    System.runAs(testUser) {
      Test.startTest();
      FileUploadController.FileWrapper result = FileUploadController.getFile(
        null
      );
      Test.stopTest();

      Assert.isNull(result, 'Expected null for null ID');
    }
  }

  @IsTest
  static void testUnlinkFile() {
    setup();
    System.runAs(testUser) {
      Account acc = new Account(Name = 'Test Account');
      insert acc;

      ContentVersion cv = new ContentVersion(
        Title = 'Unlink Test',
        PathOnClient = 'test.txt',
        VersionData = Blob.valueOf('Unlink Content'),
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
      FileUploadController.unlinkFile(cdl.Id);
      Test.stopTest();

      List<ContentDocumentLink> remaining = [
        SELECT Id
        FROM ContentDocumentLink
        WHERE Id = :cdl.Id
      ];
      Assert.isTrue(remaining.isEmpty(), 'CDL should have been deleted');
    }
  }

  @IsTest
  static void testUnlinkFileNullId() {
    setup();
    System.runAs(testUser) {
      Test.startTest();
      try {
        FileUploadController.unlinkFile(null);
        Assert.fail('Expected AuraHandledException');
      } catch (AuraHandledException e) {
        Assert.isNotNull(e.getMessage(), 'Error message should not be null');
      }
      Test.stopTest();
    }
  }

  @IsTest
  static void testGetDownloadUrl() {
    setup();
    System.runAs(testUser) {
      ContentVersion cv = new ContentVersion(
        Title = 'Download Test',
        PathOnClient = 'test.pdf',
        VersionData = Blob.valueOf('Download Content'),
        IsMajorVersion = true
      );
      insert cv;

      Id conDocId = [
        SELECT ContentDocumentId
        FROM ContentVersion
        WHERE Id = :cv.Id
      ]
      .ContentDocumentId;

      Test.startTest();
      String url = FileUploadController.getDownloadUrl(conDocId);
      Test.stopTest();

      Assert.isNotNull(url, 'URL should not be null');
      Assert.isTrue(
        url.startsWith('/sfc/servlet.shepherd/version/download/'),
        'URL should start with download path'
      );
    }
  }

  @IsTest
  static void testGetDownloadUrlNullId() {
    setup();
    System.runAs(testUser) {
      Test.startTest();
      String url = FileUploadController.getDownloadUrl(null);
      Test.stopTest();

      Assert.isNull(url, 'Expected null for null ID');
    }
  }
  @IsTest
  static void testGetContentDocumentLinkId() {
    setup();
    System.runAs(testUser) {
      Account acc = new Account(Name = 'Test Account');
      insert acc;

      ContentVersion cv = new ContentVersion(
        Title = 'CDL Lookup Test',
        PathOnClient = 'test.pdf',
        VersionData = Blob.valueOf('CDL Lookup Content'),
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
      Id result = FileUploadController.getContentDocumentLinkId(
        acc.Id,
        conDocId
      );
      Test.stopTest();

      Assert.isNotNull(result, 'Expected CDL ID to be returned');
      Assert.areEqual(cdl.Id, result, 'CDL ID should match');
    }
  }

  @IsTest
  static void testGetContentDocumentLinkIdNullRecordId() {
    setup();
    System.runAs(testUser) {
      Account acc = new Account(Name = 'Test Account');
      insert acc;

      ContentVersion cv = new ContentVersion(
        Title = 'CDL Null Record Test',
        PathOnClient = 'test.pdf',
        VersionData = Blob.valueOf('CDL Null Record Content'),
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
      Id result = FileUploadController.getContentDocumentLinkId(null, conDocId);
      Test.stopTest();

      Assert.isNotNull(result, 'Expected CDL ID even with null recordId');
      Assert.areEqual(
        cdl.Id,
        result,
        'CDL ID should match the first found link'
      );
    }
  }

  @IsTest
  static void testGetContentDocumentLinkIdNullParams() {
    setup();
    System.runAs(testUser) {
      Test.startTest();
      Id result = FileUploadController.getContentDocumentLinkId(null, null);
      Test.stopTest();

      Assert.isNull(result, 'Expected null for null params');
    }
  }

  @IsTest
  static void testReplaceFileVersion() {
    setup();
    System.runAs(testUser) {
      Account acc = new Account(Name = 'Test Account');
      insert acc;

      // Create the original file
      ContentVersion originalCv = new ContentVersion(
        Title = 'Original File',
        PathOnClient = 'original.pdf',
        VersionData = Blob.valueOf('Original Content'),
        IsMajorVersion = true
      );
      insert originalCv;

      Id originalDocId = [
        SELECT ContentDocumentId
        FROM ContentVersion
        WHERE Id = :originalCv.Id
      ]
      .ContentDocumentId;

      // Create the "new upload" file (simulating lightning-file-upload)
      ContentVersion newCv = new ContentVersion(
        Title = 'Updated File',
        PathOnClient = 'updated.pdf',
        VersionData = Blob.valueOf('Updated Content'),
        IsMajorVersion = true
      );
      insert newCv;

      Id newDocId = [
        SELECT ContentDocumentId
        FROM ContentVersion
        WHERE Id = :newCv.Id
      ]
      .ContentDocumentId;

      Test.startTest();
      FileUploadController.replaceFileVersion(originalDocId, newDocId);
      Test.stopTest();

      // The original document should now have a new latest version
      ContentDocument updatedDoc = [
        SELECT Title, LatestPublishedVersionId
        FROM ContentDocument
        WHERE Id = :originalDocId
      ];
      Assert.areEqual(
        'Updated File',
        updatedDoc.Title,
        'Title should be updated to new version title'
      );

      // The duplicate document should be deleted
      List<ContentDocument> duplicates = [
        SELECT Id
        FROM ContentDocument
        WHERE Id = :newDocId
      ];
      Assert.isTrue(
        duplicates.isEmpty(),
        'Duplicate ContentDocument should be deleted'
      );
    }
  }

  @IsTest
  static void testReplaceFileVersionNullParams() {
    setup();
    System.runAs(testUser) {
      Test.startTest();
      try {
        FileUploadController.replaceFileVersion(null, null);
        Assert.fail('Expected AuraHandledException');
      } catch (AuraHandledException e) {
        Assert.isNotNull(e.getMessage(), 'Error message should not be null');
      }
      Test.stopTest();
    }
  }

  @IsTest
  static void testUnlinkFileNotFound() {
    setup();
    System.runAs(testUser) {
      String prefix = ContentDocumentLink.SObjectType.getDescribe(
          SObjectDescribeOptions.DEFERRED
        )
        .getKeyPrefix();
      Id fakeCdlId = Id.valueOf(prefix + '000000000000');

      Test.startTest();
      // Should not throw exception since it check if links is empty
      FileUploadController.unlinkFile(fakeCdlId);
      Test.stopTest();

      Assert.isTrue(true, 'Executed without exception');
    }
  }

  @IsTest
  static void testReplaceFileVersionNoNewVersionFound() {
    setup();
    System.runAs(testUser) {
      ContentVersion cv = new ContentVersion(
        Title = 'Original',
        PathOnClient = 'test.pdf',
        VersionData = Blob.valueOf('Content'),
        IsMajorVersion = true
      );
      insert cv;
      Id origDocId = [
        SELECT ContentDocumentId
        FROM ContentVersion
        WHERE Id = :cv.Id
      ]
      .ContentDocumentId;

      // Create a document but NO version (hard to do, so use non-existent ID)
      String prefix = ContentDocument.SObjectType.getDescribe(
          SObjectDescribeOptions.DEFERRED
        )
        .getKeyPrefix();
      Id fakeDocId = Id.valueOf(prefix + '000000000000');

      Test.startTest();
      try {
        FileUploadController.replaceFileVersion(origDocId, fakeDocId);
        Assert.fail('Expected exception for missing version');
      } catch (AuraHandledException e) {
        Assert.isNotNull(e.getMessage(), 'Exception message should be logged');
      }
      Test.stopTest();
    }
  }
}
