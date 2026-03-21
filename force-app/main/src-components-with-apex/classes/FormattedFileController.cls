/**
 * @description Controller for the formattedFile LWC to retrieve file information.
 */
public with sharing class FormattedFileController {
  /**
   * @description Retrieves content document details for a given record.
   * @param contentDocumentId The ID of the content document to retrieve.
   * @return FileWrapper containing document details.
   */
  @AuraEnabled(cacheable=true)
  public static FileWrapper getFile(Id contentDocumentId) {
    List<ContentDocument> docs = [
      SELECT
        Id,
        Title,
        FileType,
        ContentSize,
        LatestPublishedVersionId,
        LastModifiedDate
      FROM ContentDocument
      WHERE Id = :contentDocumentId AND FileType != 'SNOTE'
      WITH USER_MODE
      LIMIT 1
    ];

    if (docs.isEmpty()) {
      return null;
    }
    return new FileWrapper(docs[0]);
  }

  /**
   * @description Wrapper class to hold file metadata.
   */
  public class FileWrapper {
    /** @description The ID of the document. */
    @AuraEnabled
    public Id id { get; set; }
    /** @description The title of the document. */
    @AuraEnabled
    public String name { get; set; }
    /** @description The file extension (lowercase). */
    @AuraEnabled
    public String extension { get; set; }
    /** @description The size of the file in bytes. */
    @AuraEnabled
    public Integer size { get; set; }
    /** @description The ID of the latest version of the document. */
    @AuraEnabled
    public String latestVersionId { get; set; }
    /** @description The last modification date. */
    @AuraEnabled
    public DateTime lastModifiedDate { get; set; }

    /**
     * @description Constructor to initialize the wrapper from a ContentDocument record.
     * @param doc The ContentDocument record.
     */
    public FileWrapper(ContentDocument doc) {
      this.id = doc.Id;
      this.name = doc.Title;
      this.extension = doc.FileType.toLowerCase();
      this.size = doc.ContentSize;
      this.latestVersionId = doc.LatestPublishedVersionId;
      this.lastModifiedDate = doc.LastModifiedDate;
    }
  }
}
