/**
 * @description This class is a controller for handling lookup operations.
 * @author santiagoparradev
 * @date 2023-10-05
 * @version 1.0
 */
public inherited sharing class LookupController {
  /**
   * @description Retrieves a list of LookupResult based on the provided selected IDs and payload.
   * @param apexClass The name of the Apex class implementing the ILookup interface.
   * @param selectedIds A list of selected IDs to filter the LookupResult.
   * @param payload Additional data required for the selection process.
   * @return A list of LookupResult that matches the selected IDs and payload.
   */
  @AuraEnabled(cacheable=true)
  public static List<LookupResult> getSelection(LookupInput input) {
    try {
      List<LookupResult> result = new List<LookupResult>();

      if (input.selectedIds.isEmpty()) {
        return result;
      }

      LookupResult.ILookup lookupClass = (LookupResult.ILookup) Type.forName(
          input.apexClass
        )
        .newInstance();

      return lookupClass.getSelection(input.selectedIds, input.payload);
    } catch (Exception e) {
      AuraHandledException error = new AuraHandledException(e.getMessage());
      error.setMessage(e.getMessage());
      throw error;
    }
  }

  /**
   * @description Retrieves a default list of LookupResult based on the provided payload.
   * @param apexClass The name of the Apex class implementing the ILookup interface.
   * @param payload Additional data required for retrieving the default LookupResult.
   * @return A list of default LookupResult based on the payload.
   */
  @AuraEnabled(cacheable=true)
  public static List<LookupResult> getDefault(LookupInput input) {
    try {
      LookupResult.ILookup lookupClass = (LookupResult.ILookup) Type.forName(
          input.apexClass
        )
        .newInstance();

      return lookupClass.getDefault(input.payload);
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  /**
   * @description Retrieves a list of LookupResult that matches the provided search terms and payload.
   * @return matching records
   */
  @AuraEnabled(cacheable=true)
  /**
   * @description Retrieves a list of matching lookup results based on the provided input.
   *
   * @param input The input criteria for the lookup.
   * @return A list of LookupResult objects that match the input criteria.
   */
  public static List<LookupResult> getMatching(LookupInput input) {
    try {
      LookupResult.ILookup lookupClass = (LookupResult.ILookup) Type.forName(
          input.apexClass
        )
        .newInstance();

      return lookupClass.getMatching(
        input.searchTerm,
        input.rawSearchTerm,
        input.payload
      );
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  /**
   * @description Retrieves a list of LookupResult based on the provided selected IDs and payload without caching.
   * @param input The input containing apexClass, selectedIds, and payload.
   * @return A list of LookupResult that matches the selected IDs and payload.
   */
  @AuraEnabled
  public static List<LookupResult> getSelectionNonCacheable(LookupInput input) {
    return getSelection(input);
  }

  /**
   * @description Retrieves a default list of LookupResult based on the provided payload without caching.
   */
  @AuraEnabled
  /**
   * @description Retrieves a default list of LookupResult based on the provided payload without caching.
   * @param input The input containing apexClass and payload.
   * @return A list of default LookupResult based on the payload.
   */
  public static List<LookupResult> getDefaultNonCacheable(LookupInput input) {
    return getDefault(input);
  }

  /**
   * @description Retrieves a list of LookupResult that matches the provided search terms and payload without caching.
   * @param input The input containing apexClass, searchTerm, rawSearchTerm, and payload.
   * @return A list of LookupResult that matches the search terms and payload.
   */
  @AuraEnabled
  public static List<LookupResult> getMatchingNonCacheable(LookupInput input) {
    return getMatching(input);
  }

  /**
   * @description This class represents the inputs for a lookup operation.
   */
  public class LookupInput {
    /**
     * @description The name of the Apex class to be used.
     */
    @AuraEnabled
    public String apexClass { get; set; }

    /**
     * @description The search term entered by the user.
     */
    @AuraEnabled
    public String searchTerm { get; set; }

    /**
     * @description The raw search term before any processing.
     */
    @AuraEnabled
    public String rawSearchTerm { get; set; }

    /**
     * @description Additional payload information for the lookup operation.
     */
    @AuraEnabled
    public String payload { get; set; }

    /**
     * @description A list of selected record IDs.
     */
    @AuraEnabled
    public List<String> selectedIds { get; set; }
  }

  public with sharing class TestClass implements LookupResult.ILookup {
    public List<LookupResult> getSelection(
      List<String> selectedIds,
      String payload
    ) {
      return new List<LookupResult>();
    }

    public List<LookupResult> getDefault(String payload) {
      return new List<LookupResult>();
    }

    public List<LookupResult> getMatching(
      String searchTerm,
      String rawSearchTerm,
      String payload
    ) {
      return new List<LookupResult>();
    }
  }
}
