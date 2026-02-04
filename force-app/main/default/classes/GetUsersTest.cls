@IsTest
private class GetUsersTest {
  static User standardUser;

  static void setup() {
    if (standardUser == null) {
      String uniqueUserName =
        'standarduser' +
        DateTime.now().getTime() +
        '@testorg.com';
      Profile standardProfile = [
        SELECT Id
        FROM Profile
        WHERE Name = 'System Administrator'
        LIMIT 1
      ];

      standardUser = new User(
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
      insert standardUser;
    }
  }

  @IsTest
  static void testGetActiveUsers() {
    setup();
    System.runAs(standardUser) {
      Test.startTest();
      List<User> users = GetUsers.getActiveUsers();
      Test.stopTest();
      System.assertNotEquals(null, users, 'Returned list should not be null');
      System.assert(users.size() > 0, 'Should return at least one active user');
      for (User usr : users) {
        System.assertNotEquals(null, usr.Name, 'User Name should not be null');
        System.assertNotEquals(
          null,
          usr.Email,
          'User Email should not be null'
        );
      }
    }
  }
}
