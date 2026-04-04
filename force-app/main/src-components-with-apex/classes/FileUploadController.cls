/**
 * @description Controller for the fileUpload LWC to retrieve file information and manage file actions.
 */
public with sharing class FileUploadController {
  /**
   * @description Retrieves content document details for a given record.
   * @param recordId The ID of the content document or content document link to retrieve.
   * @return FileWrapper containing document details.
   */
  @AuraEnabled(cacheable=true)
  public static FileWrapper getFile(Id recordId) {
    if (recordId == null) {
      return null;
    }

    String sObjName = recordId.getSobjectType().getDescribe().getName();

    if (sObjName == 'ContentDocumentLink') {
      List<ContentDocumentLink> links = [
        SELECT
          ContentDocument.Id,
          ContentDocument.Title,
          ContentDocument.FileType,
          ContentDocument.ContentSize,
          ContentDocument.LatestPublishedVersionId,
          ContentDocument.LastModifiedDate
        FROM ContentDocumentLink
        WHERE Id = :recordId
        WITH USER_MODE
        LIMIT 1
      ];

      if (links.isEmpty() || links[0].ContentDocument.FileType == 'SNOTE') {
        return null;
      }
      return new FileWrapper(links[0].ContentDocument);
    } else if (sObjName == 'ContentDocument') {
      List<ContentDocument> docs = [
        SELECT
          Id,
          Title,
          FileType,
          ContentSize,
          LatestPublishedVersionId,
          LastModifiedDate
        FROM ContentDocument
        WHERE Id = :recordId AND FileType != 'SNOTE'
        WITH USER_MODE
        LIMIT 1
      ];

      if (docs.isEmpty()) {
        return null;
      }
      return new FileWrapper(docs[0]);
    }

    return null;
  }

  /**
   * @description Unlinks a file from a record by deleting the ContentDocumentLink.
   * @param contentDocumentLinkId The ID of the ContentDocumentLink to delete.
   */
  @AuraEnabled
  public static void unlinkFile(Id contentDocumentLinkId) {
    if (contentDocumentLinkId == null) {
      throw new AuraHandledException('ContentDocumentLink ID is required.');
    }

    List<ContentDocumentLink> links = [
      SELECT Id
      FROM ContentDocumentLink
      WHERE Id = :contentDocumentLinkId
      WITH USER_MODE
      LIMIT 1
    ];

    if (!links.isEmpty()) {
      delete as user links;
    }
  }

  /**
   * @description Returns the download URL for a given ContentDocument.
   * @param contentDocumentId The ID of the ContentDocument.
   * @return The download URL string.
   */
  @AuraEnabled(cacheable=true)
  public static String getDownloadUrl(Id contentDocumentId) {
    if (contentDocumentId == null) {
      return null;
    }

    List<ContentDocument> docs = [
      SELECT LatestPublishedVersionId
      FROM ContentDocument
      WHERE Id = :contentDocumentId
      WITH USER_MODE
      LIMIT 1
    ];

    if (docs.isEmpty() || docs[0].LatestPublishedVersionId == null) {
      return null;
    }

    return '/sfc/servlet.shepherd/version/download/' +
      docs[0].LatestPublishedVersionId;
  }

  /**
   * @description Finds the ContentDocumentLink ID for a given record and document.
   * @param recordId The parent record ID (LinkedEntityId).
   * @param contentDocumentId The ContentDocument ID.
   * @return The ContentDocumentLink ID, or null if not found.
   */
  @AuraEnabled
  public static Id getContentDocumentLinkId(Id recordId, Id contentDocumentId) {
    if (contentDocumentId == null) {
      return null;
    }

    List<ContentDocumentLink> links;
    if (recordId == null) {
      links = [
        SELECT Id
        FROM ContentDocumentLink
        WHERE ContentDocumentId = :contentDocumentId
        WITH USER_MODE
        LIMIT 1
      ];
    } else {
      links = [
        SELECT Id
        FROM ContentDocumentLink
        WHERE
          LinkedEntityId = :recordId
          AND ContentDocumentId = :contentDocumentId
        WITH USER_MODE
        LIMIT 1
      ];
    }

    return links.isEmpty() ? null : links[0].Id;
  }

  /**
   * @description Replaces the file version on an existing ContentDocument with the
   *   data from a newly uploaded ContentDocument (created by lightning-file-upload).
   *   The new duplicate document is deleted after copying.
   * @param originalContentDocumentId The ID of the original ContentDocument to update.
   * @param newContentDocumentId The ID of the newly uploaded (duplicate) ContentDocument.
   */
  @AuraEnabled
  public static void replaceFileVersion(
    Id originalContentDocumentId,
    Id newContentDocumentId
  ) {
    if (originalContentDocumentId == null || newContentDocumentId == null) {
      throw new AuraHandledException(
        'Both original and new ContentDocument IDs are required.'
      );
    }

    List<ContentVersion> newVersions = [
      SELECT Title, PathOnClient, VersionData, FileType
      FROM ContentVersion
      WHERE ContentDocumentId = :newContentDocumentId AND IsLatest = TRUE
      WITH USER_MODE
      LIMIT 1
    ];

    if (newVersions.isEmpty()) {
      throw new AuraHandledException('New file version not found.');
    }

    ContentVersion newCv = newVersions[0];

    ContentVersion replacement = new ContentVersion(
      ContentDocumentId = originalContentDocumentId,
      Title = newCv.Title,
      PathOnClient = newCv.PathOnClient,
      VersionData = newCv.VersionData,
      IsMajorVersion = true
    );
    insert as user replacement;

    delete [
      SELECT Id
      FROM ContentDocument
      WHERE Id = :newContentDocumentId
      WITH USER_MODE
      LIMIT 1
    ];
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
