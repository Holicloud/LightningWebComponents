public with sharing class CustomDataTableController {
  @AuraEnabled(cacheable=true)
  public static Map<String, Object> getFieldInformation(
    String objectApiName,
    List<String> fieldApiNames
  ) {
    objectApiName = Schema.getGlobalDescribe()
      .get(objectApiName)
      .getDescribe()
      .getName();
    Map<String, Object> result = new Map<String, Object>();

    try {
      Map<String, Schema.DescribeFieldResult> describeByField = FieldUtil.getDescribeByField(
        objectApiName,
        new Set<String>(fieldApiNames),
        true
      );

      for (String fieldApiName : describeByField.keySet()) {
        Schema.DescribeFieldResult describe = describeByField.get(fieldApiName);
        Map<String, Object> singleResult = (Map<String, Object>) JSON.deserializeUntyped(
          JSON.serialize(describe)
        );

        if (fieldApiName.contains('.')) {
          singleResult.put('updateable', false);
          singleResult.put('name', fieldApiName);
        } else {
          singleResult.put('name', describe.getName());
          if (describe.getController() != null) {
            singleResult.put(
              'controllerLabel',
              describe.getController().getDescribe().getLabel()
            );
          }
        }

        singleResult.put('accesible', describe.isAccessible());

        result.put(fieldApiName, singleResult);
      }

      return result;
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  @AuraEnabled(cacheable=true)
  public static FindRecordsWrapper getRecords(String queryParameters) {
    System.debug(queryParameters);
    QueryParameters parameters = ((QueryParameters) JSON.deserialize(
      queryParameters,
      QueryParameters.class
    ));
    fflib_QueryFactory queryFactory = new fflib_QueryFactory(
      Schema.getGlobalDescribe().get(parameters.objectApiName)
    );

    try {
      queryFactory
        .setOffSet(parameters.offSet)
        .setLimit(parameters.limitOfRecords)
        .selectField('RecordTypeId')
        .selectFields(new List<String>(new Set<String>(parameters.fields)));

      if (String.isNotBlank(parameters.sortedBy)) {
        queryFactory.setOrdering(
          parameters.sortedBy,
          parameters.sortDirection == 'desc'
            ? fflib_QueryFactory.SortOrder.DESCENDING
            : fflib_QueryFactory.SortOrder.ASCENDING
        );
        queryFactory.addOrdering('Id', fflib_QueryFactory.SortOrder.ASCENDING);
      } else {
        queryFactory.setOrdering('Id', fflib_QueryFactory.SortOrder.ASCENDING);
      }

      if (String.isNotBlank(parameters.whereClause)) {
        queryFactory.setCondition(parameters.whereClause.replace('"', '\''));
      }

      String countQuery = queryFactory.getCondition() != null
        ? ' WHERE ' + queryFactory.getCondition()
        : '';

      return new FindRecordsWrapper(
        Database.countQuery(
          'SELECT COUNT() FROM ' + parameters.objectApiName + countQuery
        ),
        Database.query(queryFactory.toSOQL())
      );
    } catch (Exception e) {
      AuraHandledException error = new AuraHandledException(e.getMessage());
      error.setMessage(error.getMessage() + queryFactory.toSOQL());
      throw error;
    }
  }

  @AuraEnabled(cacheable=false)
  public static FindRecordsWrapper getRecordsNonCacheable(
    String queryParameters
  ) {
    return getRecords(queryParameters);
  }

  public class FindRecordsWrapper {
    @AuraEnabled
    public Integer totalRecordCount { get; set; }

    @AuraEnabled
    public List<SObject> records { get; set; }

    public FindRecordsWrapper(Integer totalRecordCount, List<SObject> records) {
      this.totalRecordCount = totalRecordCount;
      this.records = records;
    }
  }

  private class QueryParameters {
    public Integer limitOfRecords;
    public Integer offSet;
    public String objectApiName;
    public String sortedBy;
    public String sortDirection;
    public List<String> fields = new List<String>();
    public String whereClause;
  }
}
