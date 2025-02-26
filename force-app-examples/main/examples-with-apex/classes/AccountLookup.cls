public with sharing class AccountLookup implements LookupResult.ILookup {
  public final static Map<String, Object> ACCOUNT_ICON = new Map<String, Object>{
    'iconName' => 'standard:account'
  };

  public List<LookupResult> getSelection(
    List<String> selectedIds,
    String payload
  ) {
    List<LookupResult> result = new List<LookupResult>();

    for (Account account : [
      SELECT Id, Name
      FROM Account
      WHERE Id IN :selectedIds
      WITH USER_MODE
    ]) {
      result.add(buildResult(account));
    }

    return result;
  }

  public List<LookupResult> getMatching(
    String searchTerm,
    String rawSearchTerm,
    String payload
  ) {
    List<LookupResult> result = new List<LookupResult>();
    searchTerm = '%' + searchTerm + '%';

    for (Account account : [
      SELECT Id, Name
      FROM Account
      WHERE Name LIKE :searchTerm
      WITH USER_MODE
    ]) {
      result.add(buildResult(account));
    }

    return result;
  }

  public List<LookupResult> getDefault(String payload) {
    List<LookupResult> result = new List<LookupResult>();

    for (Account account : [
      SELECT Id, Name
      FROM Account
      WITH USER_MODE
      LIMIT 10
    ]) {
      result.add(buildResult(account));
    }

    return result;
  }

  private LookupResult buildResult(Account account) {
    LookupResult result = new LookupResult();
    result.id = account.Id;
    result.icon = ACCOUNT_ICON;
    result.title = account.Name;

    return result;
  }
}
