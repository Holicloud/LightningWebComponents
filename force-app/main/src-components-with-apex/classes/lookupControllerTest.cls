@isTest
private class LookupControllerTest {
  @isTest
  static void testMethodLookupController() {
    LookupController.LookupInput lookupInputs = new LookupController.LookupInput();
    lookupInputs.selectedIds = new List<String>{ 'id' };
    lookupInputs.apexClass = 'LookupController.TestClass';
    lookupInputs.payload = '';

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
    System.runAs(standarduser) {
      Test.startTest();
      List<LookupResult> lookupResultSelection = LookupController.getSelection(
        lookupInputs
      );
      List<LookupResult> lookupResultDefault = LookupController.getDefault(
        lookupInputs
      );
      List<LookupResult> lookupResultMatching = LookupController.getMatching(
        lookupInputs
      );
      Test.stopTest();
      Assert.isNotNull(
        lookupResultSelection,
        'lookupResultSelection should not be null'
      );
      Assert.isNotNull(
        lookupResultDefault,
        'lookupResultDefault should not be null'
      );
      Assert.isNotNull(
        lookupResultMatching,
        'lookupResultMatching should not be null'
      );
    }
  }
}
