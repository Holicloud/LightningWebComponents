public with sharing class DatatableSampleController {
  @AuraEnabled(cacheable=true)
  public static List<DataTest__c> getData() {
    try {
      return [
        SELECT
          Checkbox__c,
          CreatedDate,
          Currency__c,
          Date__c,
          Email__c,
          Id,
          LastModifiedBy.Name,
          Name,
          OwnerId,
          Picklist__c,
          PicklistMultiSelect__c,
          TextArea__c,
          Time__c,
          Url__c
        FROM DataTest__c
        LIMIT 25
      ];
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }
}
