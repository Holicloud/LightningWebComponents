/**
 * @description test AccountLookup methods
 */
@IsTest
private class AccountLookupTest {
  static User standardUser;
  static List<Account> setupAccounts = new List<Account>();

  static void setupData() {
    Account account = new Account(Name = 'Test Account');
    Account secondaryAccount = new Account(Name = 'Test Account');
    setupAccounts.add(account);
    setupAccounts.add(secondaryAccount);
    insert setupAccounts;

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
  private static void shouldGetSelection() {
    setupData();
    System.runAs(standarduser) {
      Test.startTest();
      List<LookupResult> result = new AccountLookup()
        .getSelection(new List<String>{ setupAccounts[0].Id }, null);
      Assert.areEqual(
        result.size(),
        1,
        'AccountLookup should return selection'
      );
      Assert.areEqual(
        result[0].id,
        setupAccounts[0].Id,
        'AccountLookup should return selection'
      );
      Test.stopTest();
    }
  }

  @IsTest
  private static void shouldGetMatching() {
    setupData();
    System.runAs(standarduser) {
      Test.startTest();
      List<LookupResult> result = new AccountLookup()
        .getMatching('Test Account', null, null);
      Assert.areEqual(
        result.size(),
        2,
        'AccountLookup should return selection'
      );
      Assert.areEqual(
        result[0].id,
        setupAccounts[0].Id,
        'AccountLookup should return selection'
      );
      Assert.areEqual(
        result[1].id,
        setupAccounts[1].Id,
        'AccountLookup should return selection'
      );
      Test.stopTest();
    }
  }

  @IsTest
  private static void shouldGetDefault() {
    setupData();
    System.runAs(standarduser) {
      Test.startTest();
      List<LookupResult> result = new AccountLookup().getDefault(null);
      Assert.areEqual(
        result.size(),
        2,
        'AccountLookup should return selection'
      );
      Assert.areEqual(
        result[0].id,
        setupAccounts[0].Id,
        'AccountLookup should return selection'
      );
      Assert.areEqual(
        result[1].id,
        setupAccounts[1].Id,
        'AccountLookup should return selection'
      );
      Test.stopTest();
    }
  }
}
