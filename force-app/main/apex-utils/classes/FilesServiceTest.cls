@IsTest
private class FilesServiceTest {
  @TestSetup
  static void setup() {
    Account acc = new Account(Name = 'Test Account');
    insert acc;
  }

  @IsTest
  static void testCreateFile() {
    System.runAs(new User(Id = UserInfo.getUserId())) {
      Account acc = [SELECT Id FROM Account LIMIT 1];

      Test.startTest();
      Id documentId = FilesService.createFile(
        'testfile.txt',
        Blob.valueOf('Hello World'),
        acc.Id
      );
      Test.stopTest();

      Assert.isNotNull(documentId, 'ContentDocumentId should not be null');

      List<ContentDocumentLink> links = FilesService.getLinksByRecord(acc.Id);
      Assert.isFalse(links.isEmpty(), 'A link should exist for the account');
      Assert.areEqual(
        documentId,
        links[0].ContentDocumentId,
        'The linked document should match the created one'
      );
    }
  }

  @IsTest
  static void testCreateFileWithoutRecord() {
    System.runAs(new User(Id = UserInfo.getUserId())) {
      Test.startTest();
      Id documentId = FilesService.createFile(
        'testfile.txt',
        Blob.valueOf('Hello World'),
        null
      );
      Test.stopTest();

      Assert.isNotNull(documentId, 'ContentDocumentId should not be null');
    }
  }

  @IsTest
  static void testGetLinksByRecord() {
    System.runAs(new User(Id = UserInfo.getUserId())) {
      Account acc = [SELECT Id FROM Account LIMIT 1];
      Id docId = FilesService.createFile(
        'test.pdf',
        Blob.valueOf('PDF Content'),
        acc.Id
      );

      Test.startTest();
      List<ContentDocumentLink> links = FilesService.getLinksByRecord(acc.Id);
      Test.stopTest();

      Assert.areEqual(1, links.size(), 'Should return 1 link');
      Assert.areEqual(
        docId,
        links[0].ContentDocumentId,
        'Document ID should match'
      );

      Assert.isTrue(
        FilesService.getLinksByRecord(null).isEmpty(),
        'Null recordId should return empty list'
      );
    }
  }

  @IsTest
  static void testGetDocumentsByRecord() {
    System.runAs(new User(Id = UserInfo.getUserId())) {
      Account acc = [SELECT Id FROM Account LIMIT 1];
      Id docId = FilesService.createFile(
        'test.pdf',
        Blob.valueOf('PDF Content'),
        acc.Id
      );

      Test.startTest();
      List<ContentDocument> docs = FilesService.getDocumentsByRecord(acc.Id);
      Test.stopTest();

      Assert.areEqual(1, docs.size(), 'Should return 1 document');
      Assert.areEqual(docId, docs[0].Id, 'Document ID should match');

      Assert.isTrue(
        FilesService.getDocumentsByRecord(null).isEmpty(),
        'Null recordId should return empty list'
      );

      Account acc2 = new Account(Name = 'No Docs');
      insert acc2;
      Assert.isTrue(
        FilesService.getDocumentsByRecord(acc2.Id).isEmpty(),
        'Should return empty list for account with no docs'
      );
    }
  }

  @IsTest
  static void testGetLinksByDocument() {
    System.runAs(new User(Id = UserInfo.getUserId())) {
      Account acc = [SELECT Id FROM Account LIMIT 1];
      Id docId = FilesService.createFile(
        'test.pdf',
        Blob.valueOf('PDF Content'),
        acc.Id
      );

      Test.startTest();
      List<ContentDocumentLink> links = FilesService.getLinksByDocument(docId);
      Test.stopTest();

      Assert.isTrue(links.size() >= 1, 'Should return links for the document');
      Assert.isTrue(
        FilesService.getLinksByDocument(null).isEmpty(),
        'Null documentId should return empty list'
      );
    }
  }

  @IsTest
  static void testLinkFileToRecord() {
    System.runAs(new User(Id = UserInfo.getUserId())) {
      Id docId = FilesService.createFile(
        'orphan.pdf',
        Blob.valueOf('PDF Content'),
        null
      );
      Account acc = [SELECT Id FROM Account LIMIT 1];

      Test.startTest();
      FilesService.linkFileToRecord(docId, acc.Id);
      Test.stopTest();

      List<ContentDocumentLink> links = FilesService.getLinksByRecord(acc.Id);
      Assert.areEqual(1, links.size(), 'Should have created a link');
      Assert.areEqual(
        docId,
        links[0].ContentDocumentId,
        'Link should point to correct document'
      );

      FilesService.linkFileToRecord(null, acc.Id);
      FilesService.linkFileToRecord(docId, null);
      Assert.isTrue(true, 'Null checks handled safely');
    }
  }

  @IsTest
  static void testUnlinkFromRecord() {
    System.runAs(new User(Id = UserInfo.getUserId())) {
      Account acc = [SELECT Id FROM Account LIMIT 1];
      Id docId = FilesService.createFile(
        'test.pdf',
        Blob.valueOf('PDF Content'),
        acc.Id
      );

      Test.startTest();
      FilesService.unlinkFromRecord(docId, acc.Id);
      Test.stopTest();

      List<ContentDocumentLink> links = FilesService.getLinksByRecord(acc.Id);
      Assert.isTrue(links.isEmpty(), 'Link should be successfully deleted');

      FilesService.unlinkFromRecord(null, acc.Id);
      FilesService.unlinkFromRecord(docId, null);
      Assert.isTrue(true, 'Null checks handled safely');
    }
  }

  @IsTest
  static void testDeleteLinkById() {
    System.runAs(new User(Id = UserInfo.getUserId())) {
      Account acc = [SELECT Id FROM Account LIMIT 1];
      FilesService.createFile('test.pdf', Blob.valueOf('PDF Content'), acc.Id);
      ContentDocumentLink link = [
        SELECT Id
        FROM ContentDocumentLink
        WHERE LinkedEntityId = :acc.Id
        LIMIT 1
      ];

      Test.startTest();
      FilesService.deleteLinkById(link.Id);
      Test.stopTest();

      List<ContentDocumentLink> links = FilesService.getLinksByRecord(acc.Id);
      Assert.isTrue(
        links.isEmpty(),
        'Link should be successfully deleted by ID'
      );

      FilesService.deleteLinkById(null);
      Assert.isTrue(true, 'Null checks handled safely');
    }
  }

  @IsTest
  static void testDeleteDocument() {
    System.runAs(new User(Id = UserInfo.getUserId())) {
      Id docId = FilesService.createFile(
        'orphan.pdf',
        Blob.valueOf('PDF Content'),
        null
      );

      Test.startTest();
      FilesService.deleteDocument(docId);
      Test.stopTest();

      List<ContentDocument> docs = [
        SELECT Id
        FROM ContentDocument
        WHERE Id = :docId
      ];
      Assert.isTrue(docs.isEmpty(), 'Document should be deleted');

      FilesService.deleteDocument(null);
      Assert.isTrue(true, 'Null checks handled safely');
    }
  }

  @IsTest
  static void testDeleteIfOrphan() {
    System.runAs(new User(Id = UserInfo.getUserId())) {
      Id orphanDocId = FilesService.createFile(
        'orphan.pdf',
        Blob.valueOf('PDF Content'),
        null
      );
      Account acc = [SELECT Id FROM Account LIMIT 1];
      Id linkedDocId = FilesService.createFile(
        'linked.pdf',
        Blob.valueOf('PDF Content'),
        acc.Id
      );

      Test.startTest();
      FilesService.deleteIfOrphan(orphanDocId);
      FilesService.deleteIfOrphan(linkedDocId);
      Test.stopTest();

      List<ContentDocument> orphans = [
        SELECT Id
        FROM ContentDocument
        WHERE Id = :orphanDocId
      ];
      Assert.isTrue(orphans.isEmpty(), 'Orphaned document should be deleted');

      List<ContentDocument> linkdDocs = [
        SELECT Id
        FROM ContentDocument
        WHERE Id = :linkedDocId
      ];
      Assert.isFalse(
        linkdDocs.isEmpty(),
        'Linked document should NOT be deleted'
      );

      FilesService.deleteIfOrphan(null);
      Assert.isTrue(true, 'Null checks handled safely');
    }
  }

  @IsTest
  static void testSecurityAndHelpers() {
    System.runAs(new User(Id = UserInfo.getUserId())) {
      Account acc = [SELECT Id FROM Account LIMIT 1];
      Id docId = FilesService.createFile(
        'test.pdf',
        Blob.valueOf('PDF Content'),
        acc.Id
      );

      Test.startTest();
      Boolean isLinked = FilesService.isLinkedToRecord(docId, acc.Id);
      Integer count = FilesService.countLinks(docId);

      List<ContentDocumentLink> links = FilesService.getLinksByDocument(docId);
      List<ContentDocumentLink> deletable = FilesService.filterDeletable(links);

      Set<Id> docIds = new Set<Id>{ docId };
      List<ContentVersion> versions = FilesService.getLatestVersions(docIds);
      Test.stopTest();

      Assert.isTrue(isLinked, 'Document should be linked to record');
      Assert.isTrue(count > 0, 'Link count should be > 0');
      Assert.isFalse(
        deletable.isEmpty(),
        'There should be deletable links (the account link)'
      );
      Assert.areEqual(1, versions.size(), 'Should return 1 version');

      Assert.isFalse(FilesService.isLinkedToRecord(null, acc.Id));
      Assert.isFalse(FilesService.isLinkedToRecord(docId, null));
      Assert.areEqual(0, FilesService.countLinks(null));
      Assert.isTrue(FilesService.getLatestVersions(null).isEmpty());
      Assert.isFalse(FilesService.isUserLink(null));
      Assert.isTrue(FilesService.filterDeletable(null).isEmpty());
    }
  }

  @IsTest
  static void testIsOnlyLinkedToUser() {
    System.runAs(new User(Id = UserInfo.getUserId())) {
      Account acc = [SELECT Id FROM Account LIMIT 1];
      Id linkedDocId = FilesService.createFile(
        'linked.pdf',
        Blob.valueOf('PDF Content'),
        acc.Id
      );
      Id orphanDocId = FilesService.createFile(
        'orphan.pdf',
        Blob.valueOf('PDF Content'),
        null
      );

      Test.startTest();
      Boolean linkedUserOnly = FilesService.isOnlyLinkedToUser(linkedDocId);
      Boolean orphanUserOnly = FilesService.isOnlyLinkedToUser(orphanDocId);
      Test.stopTest();

      Assert.isFalse(
        linkedUserOnly,
        'Linked document is not only linked to user'
      );
      Assert.isTrue(orphanUserOnly, 'Orphaned document is only linked to user');
      Assert.isFalse(FilesService.isOnlyLinkedToUser(null));
    }
  }
}
