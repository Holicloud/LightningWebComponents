/**
 * AccountLookup class that implements the LookupResult.ILookup interface.
 * This class is used to perform account lookup operations.
 * @description This class implements the LookupResult.ILookup interface to provide account lookup functionality.
 * @author santiagoparradev
 * @date 2023-10-05
 */
public with sharing class AccountLookup implements LookupResult.ILookup {
  public final static Map<String, Object> ACCOUNT_ICON = new Map<String, Object>{
    'iconName' => 'standard:account'
  };

  /**
   * Retrieves a list of LookupResult based on the selection criteria.
   *
   * @description This method retrieves a list of LookupResult objects based on the provided selection criteria.
   * @param selectedIds List of selected account IDs.
   * @param payload Additional payload information.
   * @return List<LookupResult> - A list of LookupResult objects that match the selection criteria.
   */
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

  /**
   * Retrieves a list of matching lookup results based on the provided criteria.
   *
   * @description This method retrieves a list of LookupResult objects based on the provided search term and payload.
   * @param searchTerm The term used to search for matching accounts.
   * @param rawSearchTerm The raw search term input by the user.
   * @param payload Additional payload information.
   * @return List<LookupResult> - A list of lookup results that match the criteria.
   */
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

  /**
   * @description Retrieves the default lookup results based on the provided payload.
   * @param payload The input string used to determine the default lookup results.
   * @return A list of LookupResult objects that match the default criteria.
   */
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
