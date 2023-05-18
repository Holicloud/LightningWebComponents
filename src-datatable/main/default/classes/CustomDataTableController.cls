public with sharing class CustomDataTableController {
  @AuraEnabled(cacheable=true)
  public static string getRecordTypeFromDeveloperName(
    String recordTypeDeveloperName,
    String objectApiName
  ) {
    try {
      return Schema.getGlobalDescribe()
        .get(objectApiName)
        .getDescribe()
        .getRecordTypeInfosByDeveloperName()
        .get(recordTypeDeveloperName)
        .getRecordTypeId();
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  @AuraEnabled(cacheable=true)
  public static Map<String, Object> getFieldInformation(
    String objectAPIName,
    List<String> fieldApiNames
  ) {
    objectApiName = Schema.getGlobalDescribe()
      .get(objectApiName)
      .getDescribe()
      .getName();
    Map<String, Object> fieldDescribeByApiName = new Map<String, Object>();

    try {
      for (String fieldApiName : fieldApiNames) {
        Schema.DescribeFieldResult describe;
        Map<String, Object> describeAsMap;

        if (fieldApiName.contains('.')) {
          UtilityDescribe fieldDescribeUtil = getFieldDescribe(
            fieldApiName,
            objectAPIName
          );
          describe = fieldDescribeUtil.fieldDescribe;
          describeAsMap = (Map<String, Object>) JSON.deserializeUntyped(
            JSON.serialize(describe)
          );
          describeAsMap.put('updateable', false);
          describeAsMap.put('name', fieldDescribeUtil.fullApiName);
        } else {
          describe = FieldUtilityClass.getFieldDescribe(
            objectAPIName,
            fieldApiName
          );
          describeAsMap = (Map<String, Object>) JSON.deserializeUntyped(
            JSON.serialize(describe)
          );
          describeAsMap.put('name', describe.getName());
          if (describe.getController() != null) {
            describeAsMap.put(
              'controllerLabel',
              describe.getController().getDescribe().getLabel()
            );
          }
        }

        describeAsMap.put('accesible', describe.isAccessible());

        fieldDescribeByApiName.put(fieldApiName, describeAsMap);
      }

      return fieldDescribeByApiName;
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

  private static UtilityDescribe getFieldDescribe(
    String relationship,
    String objectApiName
  ) {
    try {
      relationship = relationship.toUpperCase();
      List<String> fields = relationship.split('\\.');
      List<String> finalRelationShip = new List<String>();
      // everything but the last one
      String theField = fields.remove(fields.size() - 1);

      for (String lookupField : fields) {
        Map<String, Schema.SObjectField> mapOfDescribes = Schema.getGlobalDescribe()
          .get(objectApiName)
          .getDescribe()
          .fields
          .getMap();

        for (Schema.SObjectField field : mapOfDescribes.values()) {
          DescribeFieldResult theFieldDescribe = field.getDescribe();

          if (
            String.valueOf(theFieldDescribe.getType()) == 'reference' &&
            theFieldDescribe.getRelationshipName().toUpperCase() == lookupField
          ) {
            objectApiName = theFieldDescribe.getReferenceto()[0]
              .getDescribe()
              .getName();
            finalRelationShip.add(theFieldDescribe.getRelationshipName());
            break;
          }
        }
      }

      Schema.DescribeFieldResult lastField = FieldUtilityClass.getFieldDescribe(
        objectApiName,
        theField
      );
      finalRelationShip.add(lastField.getName());

      return new UtilityDescribe(
        String.join(finalRelationShip, '.'),
        lastField
      );
    } catch (Exception e) {
      throw new AuraHandledException(
        e.getMessage() +
          ' objectApiName: ' +
          objectApiName +
          ' relationship: ' +
          relationship
      );
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

  public class UtilityDescribe {
    public String fullApiName { get; set; }
    public DescribeFieldResult fieldDescribe { get; set; }

    public UtilityDescribe(
      String fullApiName,
      DescribeFieldResult fieldDescribe
    ) {
      this.fullApiName = fullApiName;
      this.fieldDescribe = fieldDescribe;
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
