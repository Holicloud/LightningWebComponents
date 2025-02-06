public class LookupResult {
  @AuraEnabled
  public String id { get; set; }
  @AuraEnabled
  public String title { get; set; }
  @AuraEnabled
  public Map<String, Object> icon { get; set; }
  @AuraEnabled
  public List<Map<String, Object>> subtitles { get; set; }
  @AuraEnabled
  public String payload { get; set; }

  public interface ILookup {
    List<LookupResult> getSelection(List<String> selectedIds, String payload);
    List<LookupResult> getDefault(String payload);
    List<LookupResult> getMatching(
      String searchTerm,
      String rawSearchTerm,
      String payload
    );
  }
}
