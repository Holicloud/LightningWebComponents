@IsTest
private class ComponentReferenceControllerTest {
  static User standarduser;

  static void setup() {
    String uniqueUserName =
      'standarduser' +
      DateTime.now().getTime() +
      '@testorg.com';
    Profile standardProfile = [
      SELECT Id
      FROM Profile
      WHERE Name = 'System Administrator'
    ];

    standarduser = new User(
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
  }
  @IsTest
  static void testGetComponents() {
    setup();
    System.runAs(standarduser) {
      Test.startTest();
      List<Component__mdt> components = ComponentReferenceController.getComponents();
      Test.stopTest();
      System.assertNotEquals(
        null,
        components,
        'Components list should not be null'
      );
    }
  }

  @IsTest
  static void testGetExamples() {
    setup();
    System.runAs(standarduser) {
      Test.startTest();
      List<ComponentExample__mdt> examples = ComponentReferenceController.getExamples();
      Test.stopTest();
      System.assertNotEquals(
        null,
        examples,
        'Examples list should not be null'
      );
    }
  }
}
