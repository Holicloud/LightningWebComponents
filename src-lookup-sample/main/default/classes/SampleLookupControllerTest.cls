@isTest(isParallel=true)
public class SampleLookupControllerTest {
  @isTest
  static void shouldReturnAccountAndOpportunity() {
    Account account = createAccount('Account');
    Opportunity oppty = createOpportunity('Oppty');
    Test.setFixedSearchResults(new List<Id>{ account.Id, oppty.Id });

    List<List<SObject>> results = SampleLookupController.search(
      'Acc',
      new List<String>()
    );

    Assert.areEqual(1, results[0].size(), 'there should be accounts');
    Assert.areEqual(1, results[1].size(), 'there should be opps');
  }

  @isTest
  static void shouldNotReturnSelectedItem() {
    Account account = createAccount('Account');
    Opportunity oppty = createOpportunity('Oppty');
    Test.setFixedSearchResults(new List<Id>{ account.Id, oppty.Id });
    List<String> selectedIds = new List<String>();

    List<List<SObject>> results = SampleLookupController.search(
      'Acc',
      new List<String>{ account.Id }
    );

    Assert.areEqual(0, results[0].size(), 'there should not be accounts');
    Assert.areEqual(1, results[1].size(), 'there should be opps');
  }

  @isTest
  static void shouldGetRecentlyViewed() {
    Account account = createAccount('Account');
    List<Account> forView = [
      SELECT ID
      FROM Account
      WHERE Id = :account.Id
      FOR VIEW
    ];
    List<String> selectedIds = new List<String>();

    List<List<SObject>> results = SampleLookupController.getRecentlyViewed();

    Assert.areEqual(1, results[0].size(), 'there should be accounts');
    Assert.areEqual(0, results[1].size(), 'there should be not opps');
  }

  private static Account createAccount(String name) {
    Account account = new Account(Name = name);
    insert account;
    return account;
  }

  private static Opportunity createOpportunity(String name) {
    Opportunity oppty = new Opportunity(
      Name = name,
      StageName = 'open',
      CloseDate = Date.today()
    );
    insert oppty;
    return oppty;
  }
}
