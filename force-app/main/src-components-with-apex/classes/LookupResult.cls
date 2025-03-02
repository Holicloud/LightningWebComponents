/**
 * Represents the result of a lookup operation.
 * This class is used to encapsulate the details of a lookup result.
 * @description This class represents the result of a lookup operation.
 */
public class LookupResult {
  /**
   * @description The identifier of the lookup result.
   */
  @AuraEnabled
  public String id { get; set; }

  /**
   * @description The title of the lookup result.
   */
  @AuraEnabled
  public String title { get; set; }

  /**
   * @description The icon associated with the lookup result.
   */
  @AuraEnabled
  public Map<String, Object> icon { get; set; }

  /**
   * @description The subtitles of the lookup result.
   */
  @AuraEnabled
  public List<Map<String, Object>> subtitles { get; set; }

  /**
   * @description The payload of the lookup result.
   */
  @AuraEnabled
  public String payload { get; set; }

  /**
   * @description This interface defines the contract for lookup operations.
   */
  public interface ILookup {
    /**
     * @description Retrieves a list of LookupResult based on the provided selected IDs and payload.
     * @param selectedIds A list of selected IDs to filter the LookupResult.
     * @param payload Additional data required for the selection process.
     * @return A list of LookupResult that matches the selected IDs and payload.
     */
    List<LookupResult> getSelection(List<String> selectedIds, String payload);

    /**
     * @description Retrieves a default list of LookupResult based on the provided payload.
     * @param payload Additional data required for retrieving the default LookupResult.
     * @return A list of default LookupResult based on the payload.
     */
    List<LookupResult> getDefault(String payload);

    /**
     * @description Retrieves a list of LookupResult that matches the provided search terms and payload.
     * @param searchTerm The term used to search for matching LookupResult.
     * @param rawSearchTerm The raw search term used for more precise matching.
     * @param payload Additional data required for the matching process.
     * @return A list of LookupResult that matches the search terms and payload.
     */
    List<LookupResult> getMatching(
      String searchTerm,
      String rawSearchTerm,
      String payload
    );
  }
}
