/**
 * @description Controller for question catalog
 */
public with sharing class CTSI_QuestionCatalogController {
  /**
   * @description fetches question catalog given an specific type and section
   * @param formDefinitionId
   * @param formResponseId
   * @param sections
   * @return response object with catalog and answers (if there are)
   */
  @AuraEnabled(cacheable=true)
  public static Response getCatalogAndAnswers(
    Id formDefinitionId,
    Id formResponseId,
    List<String> sections
  ) {
    try {
      Response result = new Response();
      if (formDefinitionId == null) {
        return result;
      }
      result.catalog = getCatalog(formDefinitionId, new Set<String>(sections));
      result.answers = getAnswers(formResponseId, result.catalog);
      result.rules = getRules(result.catalog);
      return result;
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  private static List<Question_Answer__c> getAnswers(
    Id formResponseId,
    List<Question_Catalog__c> catalog
  ) {
    if (formResponseId == null || catalog.isEmpty()) {
      return new List<Question_Answer__c>();
    }

    return [
      SELECT Id, Question__c, Answer__c, Order__c, Question_Catalog__c
      FROM Question_Answer__c
      WHERE
        Question_Catalog__c IN :catalog
        AND Form_Response__c = :formResponseId
      WITH USER_MODE
    ];
  }

  private static List<Question_Catalog__c> getCatalog(
    Id formDefinitionId,
    Set<String> sections
  ) {
    List<Question_Catalog__c> result = [
      SELECT
        Active__c,
        Answer_Data_Type__c,
        Field__c,
        Group_By__c,
        Id,
        Name,
        Object__c,
        Order__c,
        Picklist_Values__c,
        Question__c,
        Form_Section__r.Name,
        Required__c
      FROM Question_Catalog__c
      WHERE Active__c = TRUE AND Form_Definition__c = :formDefinitionId
      WITH USER_MODE
      ORDER BY Order__c NULLS LAST
    ];

    if (!sections.isEmpty()) {
      List<Question_Catalog__c> filtered = new List<Question_Catalog__c>();

      for (Question_Catalog__c record : result) {
        String sectionName = record.Form_Section__r?.Name;

        if (String.isNotBlank(sectionName) && sections.contains(sectionName)) {
          filtered.add(record);
        }
      }

      result = filtered;
    }

    return result;
  }

  private static List<Question_Rule__c> getRules(
    List<Question_Catalog__c> questionCatalogs
  ) {
    try {
      if (questionCatalogs.isEmpty()) {
        return new List<Question_Rule__c>();
      }

      return [
        SELECT
          Id,
          Name,
          Rule_Type__c,
          Logic_Type__c,
          Condition_Logic__c,
          Question_Catalog__c,
          Overwrite_Picklist_Values__c,
          Active__c,
          Autopopulate_Source_Path__c,
          Autopopulate_Value_Raw__c,
          Autopopulate_Source_Type__c,
          CreatedDate,
          (
            SELECT
              Id,
              Source_Type__c,
              Source_Path__c,
              Operator__c,
              Question_Catalog__r.Question__c,
              Value__c,
              Order__c,
              Not__c
            FROM Rule_Conditions__r
            ORDER BY Order__c ASC
          )
        FROM Question_Rule__c
        WHERE Question_Catalog__c IN :questionCatalogs
        WITH USER_MODE
        ORDER BY Active__c DESC, CreatedDate DESC
      ];
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  /**
   * @description Inner class used to wrap catalog items, answers and rules for the front-end
   */
  public class Response {
    @AuraEnabled
    public List<Question_Catalog__c> catalog;
    @AuraEnabled
    public List<Question_Answer__c> answers;
    @AuraEnabled
    public List<Question_Rule__c> rules;
  }
}
