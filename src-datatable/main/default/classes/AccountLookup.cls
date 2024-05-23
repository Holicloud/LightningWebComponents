public with sharing class AccountLookup implements LookupResult.ILookupResult {
  public final static Map<String, Object> ACCOUNT_ICON = new Map<String, Object>{
    'iconName' => 'standard:account'
  };

  public List<LookupResult> getSelection(List<String> selectedIds, Map<String, Object> payload) {
    List<LookupResult> result = new List<LookupResult>();

    List<Account> matchingAccount = [
      SELECT Name, Owner.Name
      FROM Account
      WHERE Id IN :selectedIds
      LIMIT 1
    ];

    return buildResults(matchingAccount);
  }

  public List<LookupResult> getDefaultSearchResults(Map<String, Object> payload) {
    List<LookupResult> result = new List<LookupResult>();

    List<Account> Accounts = [
      SELECT Name, Owner.Name
      FROM Account
      LIMIT 10
    ];

    return buildResults(accounts);
  }

  public List<LookupResult> getSearchResults(
    String searchTerm,
    List<String> selectedIds,
    Map<String, Object> payload
  ) {
    List<LookupResult> result = new List<LookupResult>();

    searchTerm = '%' + searchTerm + '%';

    List<Account> accounts = [
      SELECT Name, Owner.Name
      FROM Account
      WHERE Id NOT IN :selectedIds AND (Name LIKE :searchTerm OR Owner.Name LIKE :searchTerm)
    ];

    return buildResults(accounts);
  }

  private List<LookupResult> buildResults(List<Account> accounts) {
    List<LookupResult> result = new List<LookupResult>();

    for (Account Account : Accounts) {
      LookupResult singleResult = new LookupResult();
      singleResult.id = account.Id;
      singleResult.icon = ACCOUNT_ICON;
      singleResult.title = account.Name;
      List<LookupResult.Subtitle> subtitles = new List<LookupResult.Subtitle>();

      if (String.isNotBlank(account.Owner.Name)) {
        LookupResult.Subtitle email = new LookupResult.Subtitle();
        email.label = 'Owner Name';
        email.value = account.Owner.Name;
        subtitles.add(email);
      }

      singleResult.subtitles = subtitles;
      result.add(singleResult);
    }

    return result;
  }
}
