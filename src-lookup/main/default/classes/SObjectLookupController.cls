public with sharing class SObjectLookupController {
  @AuraEnabled(cacheable=true)
  public static List<List<SObject>> getDatasetRecords(
    String searchTerm,
    List<String> selectedIds,
    String datasets
  ) {
    try {
      List<List<SObject>> result = new List<List<SObject>>();
      Set<Id> resultIds = new Set<Id>();

      List<QueryParameters> listOfParameters = (List<QueryParameters>) JSON.deserialize(
        datasets,
        List<QueryParameters>.class
      );

      for (QueryParameters parameters : listOfParameters) {
        fflib_QueryFactory queryFactory = new fflib_QueryFactory(
          Schema.getGlobalDescribe().get(parameters.sobjectApiName)
        );

        queryFactory.setLimit(50).selectFields(parameters.queryFields);

        applySearchTerm(queryFactory, searchTerm, parameters.searchByFields);
        applyWhereClause(queryFactory, parameters.whereClause);
        applySelectedIds(queryFactory, selectedIds);

        List<SObject> singleResult = new List<SObject>();

        for (SObject record : Database.query(queryFactory.toSOQL())) {
          if (!resultIds.contains(record.Id)) {
            singleResult.add(record);
            resultIds.add(record.Id);
          }
        }

        result.add(singleResult);
      }

      return result;
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  @AuraEnabled(cacheable=true)
  public static List<List<SObject>> getInitialSelection(
    List<String> initialSelection,
    String datasets
  ) {
    fflib_QueryFactory queryFactory;

    try {
      List<List<SObject>> result = new List<List<SObject>>();
      Set<Id> resultIds = new Set<Id>();

      List<QueryParameters> listOfParameters = (List<QueryParameters>) JSON.deserialize(
        datasets,
        List<QueryParameters>.class
      );

      for (QueryParameters parameters : listOfParameters) {
        queryFactory = new fflib_QueryFactory(
          Schema.getGlobalDescribe().get(parameters.sobjectApiName)
        );

        queryFactory
          .setCondition('Id IN :initialSelection')
          .selectFields(parameters.queryFields);

        applyWhereClause(queryFactory, parameters.whereClause);

        List<SObject> singleResult = new List<SObject>();

        for (SObject record : Database.query(queryFactory.toSOQL())) {
          if (!resultIds.contains(record.Id)) {
            singleResult.add(record);
            resultIds.add(record.Id);
          }
        }

        result.add(singleResult);
      }

      return result;
    } catch (Exception e) {
      throw new AuraHandledException(
        e.getMessage() + ' Query: ' + queryFactory.toSOQL()
      );
    }
  }

  @AuraEnabled(cacheable=true)
  public static List<List<SObject>> getRecentlyViewed(String datasets) {
    fflib_QueryFactory queryFactory;

    try {
      List<List<SObject>> result = new List<List<SObject>>();
      Set<Id> resultIds = new Set<Id>();

      List<QueryParameters> parameters = (List<QueryParameters>) JSON.deserialize(
        datasets,
        List<QueryParameters>.class
      );
      List<Id> recentIds = getRecentlyViewedRecords(parameters);

      for (QueryParameters param : parameters) {
        queryFactory = new fflib_QueryFactory(
          Schema.getGlobalDescribe().get(param.sobjectApiName)
        );

        queryFactory
          .setLimit(50)
          .selectFields(param.queryFields)
          .setCondition('Id IN (\'' + String.join(recentIds, '\',\'') + '\')');

        applyWhereClause(queryFactory, param.whereClause);

        List<SObject> singleResult = new List<SObject>();

        for (SObject record : Database.query(queryFactory.toSOQL())) {
          if (!resultIds.contains(record.Id)) {
            singleResult.add(record);
            resultIds.add(record.Id);
          }
        }

        result.add(singleResult);
      }

      return result;
    } catch (Exception e) {
      throw new AuraHandledException(
        e.getMessage() + ' Query: ' + queryFactory.toSOQL()
      );
    }
  }

  private static void applyWhereClause(
    fflib_QueryFactory queryFactory,
    String whereClause
  ) {
    if (String.isNotBlank(whereClause)) {
      String condition = queryFactory.getCondition() != null
        ? '(' + queryFactory.getCondition() + ') AND (' + whereClause + ')'
        : whereClause;
      queryFactory.setCondition(condition);
    }
  }

  private static void applySelectedIds(
    fflib_QueryFactory queryFactory,
    List<String> selectedIds
  ) {
    if (!selectedIds.isEmpty()) {
      String selectedIdsCondition = 'Id NOT IN :selectedIds';
      String condition = queryFactory.getCondition() != null
        ? '(' +
          queryFactory.getCondition() +
          ') AND (' +
          selectedIdsCondition +
          ')'
        : selectedIdsCondition;
      queryFactory.setCondition(condition);
    }
  }

  private static void applySearchTerm(
    fflib_QueryFactory queryFactory,
    String searchTerm,
    List<String> searchByFields
  ) {
    if (String.isNotBlank(searchTerm)) {
      Set<String> conditions = new Set<String>();

      for (String field : searchByFields) {
        conditions.add(field + ' LIKE \'%' + searchTerm + '%\'');
      }

      queryFactory.setCondition(
        String.join(new List<String>(conditions), ' OR ')
      );
    }
  }

  private static List<Id> getRecentlyViewedRecords(
    List<QueryParameters> parameters
  ) {
    Set<String> objectApiNames = new Set<String>();

    for (QueryParameters param : parameters) {
      objectApiNames.add(param.sobjectApiName);
    }

    List<Id> result = new List<Id>();

    for (RecentlyViewed record : [
      SELECT Id
      FROM RecentlyViewed
      WHERE LastViewedDate != NULL AND Type IN :objectApiNames
      ORDER BY LastViewedDate DESC
    ]) {
      result.add(record.Id);
    }

    return new List<Id>(result);
  }

  private class QueryParameters {
    public Integer limitOfRecords;
    public List<String> queryFields = new List<String>();
    public List<String> searchByFields = new List<String>();
    public String sobjectApiName;
    public String whereClause;
  }

  private class LookupControllerException extends Exception {
  }
}
