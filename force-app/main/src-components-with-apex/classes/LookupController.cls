public inherited sharing class LookupController {
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

  @AuraEnabled(cacheable=true)
  public static List<LookupResult> getDefault(
    String apexClass,
    String payload
  ) {
    try {
      List<LookupResult> result = new List<LookupResult>();

      LookupResult.ILookup lookupClass = (LookupResult.ILookup) Type.forName(
          apexClass
        )
        .newInstance();

      return lookupClass.getDefault(payload);
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  @AuraEnabled(cacheable=true)
  public static List<LookupResult> getMatching(
    String apexClass,
    String searchTerm,
    String rawSearchTerm,
    String payload
  ) {
    try {
      List<LookupResult> result = new List<LookupResult>();

      LookupResult.ILookup lookupClass = (LookupResult.ILookup) Type.forName(
          apexClass
        )
        .newInstance();

      return lookupClass.getMatching(searchTerm, rawSearchTerm, payload);
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  @AuraEnabled
  public static List<LookupResult> getSelectionNonCacheable(
    String apexClass,
    List<String> selectedIds,
    String payload
  ) {
    return getSelection(apexClass, selectedIds, payload);
  }

  @AuraEnabled
  public static List<LookupResult> getDefaultNonCacheable(
    String apexClass,
    String payload
  ) {
    return getDefault(apexClass, payload);
  }

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
