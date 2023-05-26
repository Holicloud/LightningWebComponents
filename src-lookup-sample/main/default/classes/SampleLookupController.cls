public with sharing class SampleLookupController {
  private final static Integer MAX_RESULTS = 5;

  @AuraEnabled(cacheable=true scope='global')
  public static List<List<SObject>> search(
    String searchTerm,
    List<String> selectedIds
  ) {
    // Prepare query parameters
    searchTerm += '*';

    // Execute search query
    List<List<SObject>> searchResults = [
      FIND :searchTerm
      IN ALL FIELDS
      RETURNING
        Account(
          Id,
          Name,
          BillingCity,
          OwnerId,
          AccountNumber
          WHERE id NOT IN :selectedIds),
        Opportunity(
          Id,
          Name,
          StageName,
          LeadSource,
          OwnerId
          WHERE id NOT IN :selectedIds)
      LIMIT :MAX_RESULTS
    ];

    return searchResults;
  }

  @AuraEnabled(cacheable=true scope='global')
  public static List<List<SObject>> getRecentlyViewed() {
    Set<Id> recentIds = new Set<Id>();

    for (RecentlyViewed recent : [
      SELECT Id, Name, Type
      FROM RecentlyViewed
      WHERE Type = 'Account' OR Type = 'Opportunity'
      ORDER BY LastViewedDate DESC
      LIMIT :MAX_RESULTS
    ]) {
      recentIds.add(recent.Id);
    }

    List<Opportunity> opps = [
      SELECT Id, Name, StageName, LeadSource, OwnerId
      FROM Opportunity
      WHERE Id IN :recentIds
    ];

    List<Account> accounts = [
      SELECT Id, Name, BillingCity, OwnerId, AccountNumber
      FROM Account
      WHERE Id IN :recentIds
    ];

    return new List<List<SObject>>{ accounts, opps };
  }
}
