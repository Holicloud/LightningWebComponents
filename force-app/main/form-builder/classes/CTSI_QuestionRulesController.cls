/**
 * @description Controller for question rules
 */
public without sharing class CTSI_QuestionRulesController {
  /**
   * @description fetches question catalog rules and its rule conditions
   * @param questionCatalogId a question catalog id
   * @return List of Question_Rule__c records including conditions
   */
  @AuraEnabled(cacheable=true)
  public static List<Question_Rule__c> getRules(String questionCatalogId) {
    try {
      return [
        SELECT
          Id,
          Name,
          Rule_Type__c,
          Logic_Type__c,
          Condition_Logic__c,
          Question_Catalog__c,
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
              Question_Catalog__c,
              Question_Catalog__r.Question__c,
              Value__c,
              Order__c,
              Not__c
            FROM Rule_Conditions__r
            ORDER BY Order__c ASC
          )
        FROM Question_Rule__c
        WHERE Question_Catalog__c = :questionCatalogId
        WITH USER_MODE
        ORDER BY Active__c DESC, CreatedDate DESC
      ];
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  /**
   * @description fetches rule conditions for a given question rule
   * @param questionRuleId a question rule id
   * @return A Question_Rule__c record with its rule conditions
   */
  @AuraEnabled(cacheable=true)
  public static Question_Rule__c getRule(String questionRuleId) {
    try {
      return [
        SELECT
          Id,
          Name,
          Rule_Type__c,
          Logic_Type__c,
          Condition_Logic__c,
          Question_Catalog__c,
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
              Question_Catalog__c,
              Question_Catalog__r.Question__c,
              Value__c,
              Order__c,
              Not__c
            FROM Rule_Conditions__r
            ORDER BY Order__c ASC
          )
        FROM Question_Rule__c
        WHERE Id = :questionRuleId
        WITH USER_MODE
      ];
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  /**
   * @description updates rule conditions for a specific question rule
   * @param questionRuleId the Id of the question rule
   * @param conditions the list of Rule_Condition__c records to insert
   */
  @AuraEnabled
  public static void updateConditions(
    Id questionRuleId,
    List<Rule_Condition__c> conditions
  ) {
    try {
      delete [
        SELECT Id
        FROM Rule_Condition__c
        WHERE Question_Rule__c = :questionRuleId
        WITH USER_MODE
      ];

      insert as user conditions;
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  /**
   * @description activates a question rule
   * @param questionRuleId the Id of the question rule
   */
  @AuraEnabled
  public static void activate(Id questionRuleId) {
    try {
      update as user new Question_Rule__c(
        Id = questionRuleId,
        Active__c = true
      );
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  /**
   * @description deactivates a question rule
   * @param questionRuleId the Id of the question rule
   */
  @AuraEnabled
  public static void deactivate(Id questionRuleId) {
    try {
      update as user new Question_Rule__c(
        Id = questionRuleId,
        Active__c = false
      );
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  /**
   * @description deletes a question rule and its associated conditions
   * @param questionRuleId the Id of the question rule to delete
   */
  @AuraEnabled
  public static void deleteRule(Id questionRuleId) {
    try {
      delete as user [
        SELECT Id
        FROM Rule_Condition__c
        WHERE Question_Rule__c = :questionRuleId
        WITH USER_MODE
      ];

      delete as user new Question_Rule__c(Id = questionRuleId);
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  /**
   * @description gets all rules associated with a specific form definition
   * @param formDefinitionId the Id of the form definition
   * @return List of Question_Rule__c records
   */
  @AuraEnabled(cacheable=true)
  public static List<Question_Rule__c> getRulesByFormDefinition(
    Id formDefinitionId
  ) {
    try {
      return [
        SELECT
          Id,
          Name,
          Rule_Type__c,
          Logic_Type__c,
          Condition_Logic__c,
          Question_Catalog__c,
          Question_Catalog__r.Question__c,
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
              Question_Catalog__c,
              Question_Catalog__r.Question__c,
              Value__c,
              Order__c,
              Not__c
            FROM Rule_Conditions__r
            ORDER BY Order__c ASC
          )
        FROM Question_Rule__c
        WHERE Question_Catalog__r.Form_Definition__c = :formDefinitionId
        WITH USER_MODE
        ORDER BY
          Question_Catalog__r.Order__c ASC,
          Active__c DESC,
          CreatedDate DESC
      ];
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  /**
   * @description gets active catalog items for a given form
   * @param formDefinitionId the Id of the form definition
   * @return List of active Question_Catalog__c records
   */
  @AuraEnabled(cacheable=true)
  public static List<Question_Catalog__c> getActiveCatalog(
    Id formDefinitionId
  ) {
    try {
      return [
        SELECT Id, Question__c
        FROM Question_Catalog__c
        WHERE
          Form_Definition__c != NULL
          AND Form_Definition__c = :formDefinitionId
          AND Active__c = TRUE
        WITH USER_MODE
      ];
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }
}
