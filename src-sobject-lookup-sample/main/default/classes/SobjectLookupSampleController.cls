public with sharing class SobjectLookupSampleController {
  @AuraEnabled(cacheable=true)
  public static List<String> getInitialSelection() {
    List<Opportunity> opps = [SELECT Id FROM Opportunity];

    List<Account> accounts = [SELECT Id FROM Account];

    return new List<String>{ accounts[0].Id, opps[0].Id };
  }
}
