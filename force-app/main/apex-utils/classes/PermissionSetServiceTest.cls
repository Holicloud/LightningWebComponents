@IsTest
private class PermissionSetServiceTest {
  @IsTest
  static void testAssignPermissionSets() {
    // Setup
    User testUser = createTestUser();

    PermissionSet ps = new PermissionSet(
      Name = 'TestPermSet',
      Label = 'Test Perm Set'
    );
    insert ps;

    Map<Id, Set<String>> psNamesByUserId = new Map<Id, Set<String>>{
      testUser.Id => new Set<String>{ 'TestPermSet' }
    };

    // Execution
    System.runAs(testUser) {
      Test.startTest();
      PermissionSetService.assignPermissionSets(psNamesByUserId);
      Test.stopTest();
    }

    // Validation
    List<PermissionSetAssignment> assignments = [
      SELECT Id
      FROM PermissionSetAssignment
      WHERE AssigneeId = :testUser.Id AND PermissionSetId = :ps.Id
    ];
    Assert.areEqual(1, assignments.size(), 'Should have one assignment');
  }

  @IsTest
  static void testAssignPermissionSetsDuplicate() {
    // Setup
    User testUser = createTestUser();

    PermissionSet ps = new PermissionSet(
      Name = 'TestPermSet',
      Label = 'Test Perm Set'
    );
    insert ps;

    insert new PermissionSetAssignment(
      AssigneeId = testUser.Id,
      PermissionSetId = ps.Id
    );

    Map<Id, Set<String>> psNamesByUserId = new Map<Id, Set<String>>{
      testUser.Id => new Set<String>{ 'TestPermSet' }
    };

    // Execution
    System.runAs(testUser) {
      Test.startTest();
      PermissionSetService.assignPermissionSets(psNamesByUserId);
      Test.stopTest();
    }

    // Validation - Should still only have one
    List<PermissionSetAssignment> assignments = [
      SELECT Id
      FROM PermissionSetAssignment
      WHERE AssigneeId = :testUser.Id AND PermissionSetId = :ps.Id
    ];
    Assert.areEqual(
      1,
      assignments.size(),
      'Should still have only one assignment'
    );
  }

  @IsTest
  static void testAssignPermissionSetGroups() {
    // Setup
    User testUser = createTestUser();

    // PSG creation is complex in tests (needs status 'Updated' usually)
    // For unit test purposes, we'll try to create one or assume it works if we can't fully simulate PSG recalc
    PermissionSetGroup psg = new PermissionSetGroup(
      DeveloperName = 'TestPSG',
      MasterLabel = 'Test PSG'
    );
    insert psg;

    // We need to wait for PSG to be "Updated" but in tests it might stay "Outdated"
    // Usually we just need the IDs for our service to work.

    Map<Id, Set<String>> psgNamesByUserId = new Map<Id, Set<String>>{
      testUser.Id => new Set<String>{ 'TestPSG' }
    };

    // Execution
    System.runAs(testUser) {
      Test.startTest();
      PermissionSetService.assignPermissionSetGroups(psgNamesByUserId);
      Test.stopTest();
    }

    // Validation
    List<PermissionSetAssignment> assignments = [
      SELECT Id
      FROM PermissionSetAssignment
      WHERE AssigneeId = :testUser.Id AND PermissionSetGroupId = :psg.Id
    ];
    // In some orgs, PSG must be 'Updated' before assignment, but our service just does the DML.
    // If the DML succeeds, the assignment should exist.
    Assert.areEqual(1, assignments.size(), 'Should have one PSG assignment');
  }

  private static User createTestUser() {
    Profile p = [SELECT Id FROM Profile WHERE Name = 'Standard User' LIMIT 1];
    String uniqueUserName =
      'testuser' +
      DateTime.now().getTime() +
      '@testorg.com';
    User u = new User(
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
    insert u;
    return u;
  }
}
