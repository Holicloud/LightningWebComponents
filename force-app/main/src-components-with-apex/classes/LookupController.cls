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
  public static List<LookupResult> getSelection(
    String apexClass,
    List<String> selectedIds,
    String payload
  ) {
    try {
      List<LookupResult> result = new List<LookupResult>();

      if (selectedIds.isEmpty()) {
        return result;
      }

      LookupResult.ILookup lookupClass = (LookupResult.ILookup) Type.forName(
          apexClass
        )
        .newInstance();

      return lookupClass.getSelection(selectedIds, payload);
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  /**
   * @description Retrieves a default list of LookupResult based on the provided payload.
   * @param apexClass The name of the Apex class implementing the ILookup interface.
   * @param payload Additional data required for retrieving the default LookupResult.
   * @return A list of default LookupResult based on the payload.
   */
  @AuraEnabled(cacheable=true)
  public static List<LookupResult> getDefault(
    String apexClass,
    String payload
  ) {
    try {
      LookupResult.ILookup lookupClass = (LookupResult.ILookup) Type.forName(
          apexClass
        )
        .newInstance();

      return lookupClass.getDefault(payload);
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  /**
   * @description Retrieves a list of LookupResult that matches the provided search terms and payload.
   * @param apexClass The name of the Apex class implementing the ILookup interface.
   * @param searchTerm The term used to search for matching LookupResult.
   * @param rawSearchTerm The raw search term used for more precise matching.
   * @param payload Additional data required for the matching process.
   * @return A list of LookupResult that matches the search terms and payload.
   */
  @AuraEnabled(cacheable=true)
  public static List<LookupResult> getMatching(
    String apexClass,
    String searchTerm,
    String rawSearchTerm,
    String payload
  ) {
    try {
      LookupResult.ILookup lookupClass = (LookupResult.ILookup) Type.forName(
          apexClass
        )
        .newInstance();

      return lookupClass.getMatching(searchTerm, rawSearchTerm, payload);
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  /**
   * @description Retrieves a list of LookupResult based on the provided selected IDs and payload without caching.
   * @param apexClass The name of the Apex class implementing the ILookup interface.
   * @param selectedIds A list of selected IDs to filter the LookupResult.
   * @param payload Additional data required for the selection process.
   * @return A list of LookupResult that matches the selected IDs and payload.
   */
  @AuraEnabled
  public static List<LookupResult> getSelectionNonCacheable(
    String apexClass,
    List<String> selectedIds,
    String payload
  ) {
    return getSelection(apexClass, selectedIds, payload);
  }

  /**
   * @description Retrieves a default list of LookupResult based on the provided payload without caching.
   * @param apexClass The name of the Apex class implementing the ILookup interface.
   * @param payload Additional data required for retrieving the default LookupResult.
   * @return A list of default LookupResult based on the payload.
   */
  @AuraEnabled
  public static List<LookupResult> getDefaultNonCacheable(
    String apexClass,
    String payload
  ) {
    return getDefault(apexClass, payload);
  }

  /**
   * @description Retrieves a list of LookupResult that matches the provided search terms and payload without caching.
   * @param apexClass The name of the Apex class implementing the ILookup interface.
   * @param searchTerm The term used to search for matching LookupResult.
   * @param rawSearchTerm The raw search term used for more precise matching.
   * @param payload Additional data required for the matching process.
   * @return A list of LookupResult that matches the search terms and payload.
   */
  @AuraEnabled
  public static List<LookupResult> getMatchingNonCacheable(
    String apexClass,
    String searchTerm,
    String rawSearchTerm,
    String payload
  ) {
    return getMatching(apexClass, searchTerm, rawSearchTerm, payload);
  }
}
