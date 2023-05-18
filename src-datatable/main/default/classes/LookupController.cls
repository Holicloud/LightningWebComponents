public with sharing class LookupController {
  @AuraEnabled(cacheable=true)
  public static List<SObject> getRecords(String queryParameters) {
    QueryParameters parameters = ((QueryParameters) JSON.deserialize(
      queryParameters,
      QueryParameters.class
    ));

    fflib_QueryFactory queryFactory = new fflib_QueryFactory(
      Schema.getGlobalDescribe().get(parameters.objectApiName)
    );

    try {
      queryFactory
        .setLimit(parameters.limitOfRecords)
        .selectFields(parameters.queryFields);
      if (parameters.value != null) {
        String value = parameters.value;
        queryFactory.setCondition('Id = :value').setLimit(1);
      } else if (String.isNotBlank(parameters.searchKey)) {
        Set<String> conditions = new Set<String>();

        for (String field : parameters.searchByFields) {
          conditions.add(field + ' LIKE \'%' + parameters.searchKey + '%\'');
        }

        queryFactory.setCondition(
          String.join(new List<String>(conditions), ' OR ')
        );
      } else if (parameters.displayRecentlyViewed == true) {
        List<Id> recentlyViewed = new List<Id>(
          getRecentlyViewedRecords(parameters.objectApiName)
        );

        if (!recentlyViewed.isEmpty()) {
          queryFactory.setCondition(
            'Id IN (\'' + String.join(recentlyViewed, '\', \' ') + '\')'
          );
        }
      }

      if (String.isNotBlank(parameters.whereClause)) {
        queryFactory.setCondition(
          queryFactory.getCondition() != null
            ? '(' +
              queryFactory.getCondition() +
              ') AND (' +
              parameters.whereClause +
              ')'
            : parameters.whereClause
        );
      }

      return Database.query(queryFactory.toSOQL());
    } catch (Exception e) {
      throw new AuraHandledException(
        e.getMessage() + ' Query:' + queryFactory.getCondition()
      );
    }
  }

  public static Set<Id> getRecentlyViewedRecords(String objectApiName) {
    Set<Id> result = new Set<Id>();

    for (RecentlyViewed record : [
      SELECT Id
      FROM RecentlyViewed
      WHERE LastViewedDate != NULL AND Type = :objectApiName
      ORDER BY LastViewedDate DESC
    ]) {
      result.add(record.Id);
    }

    return result;
  }

  private class QueryParameters {
    public Boolean displayRecentlyViewed = false;
    public Id value;
    public Integer limitOfRecords;
    public List<String> queryFields = new List<String>();
    public List<String> searchByFields = new List<String>();
    public String objectApiName;
    public String searchKey;
    public String whereClause;
  }
}
