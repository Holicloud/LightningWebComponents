public with sharing class SObjectDatatableController {
  @AuraEnabled
  public static Map<String, Map<String, Object>> getSObjectFieldConfig(
    List<SObjectFieldConfig> configs
  ) {
    try {
      Map<String, Map<String, Object>> result = new Map<String, Map<String, Object>>();

      for (SObjectFieldConfig config : configs) {
        Schema.DescribeFieldResult describe = FieldUtility.getFieldDescribe(
          config.objectName,
          config.field
        );

        Map<String, Object> singleResult = (Map<String, Object>) JSON.deserializeUntyped(
          JSON.serialize(describe)
        );
        singleResult.put('accesible', describe.isAccessible());
        result.put(config.objectName + config.field, singleResult);
      }

      return result;
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  public class SObjectFieldConfig {
    @AuraEnabled
    public String objectName { get; set; }

    @AuraEnabled
    public String field { get; set; }
  }
}
