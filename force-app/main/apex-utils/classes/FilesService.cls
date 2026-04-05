/**
 * @description Centralized service class for managing Salesforce Files (ContentDocument, ContentVersion, ContentDocumentLink).
 * Designed to execute in system context to handle external user operations safely (e.g. community users).
 */
@SuppressWarnings('PMD.ApexCRUDViolation')
public without sharing class FilesService {
  // --- 1. Read / Inspect ---

  /**
   * @description Gets all ContentDocumentLinks for a specific record.
   * @param recordId The ID of the record to find links for.
   * @return List of ContentDocumentLink records.
   */
  public static List<ContentDocumentLink> getLinksByRecord(Id recordId) {
    if (recordId == null) {
      return new List<ContentDocumentLink>();
    }
    return [
      SELECT Id, ContentDocumentId, LinkedEntityId, ShareType, Visibility
      FROM ContentDocumentLink
      WHERE LinkedEntityId = :recordId
      WITH SYSTEM_MODE
    ];
  }

  /**
   * @description Gets all ContentDocuments linked to a specific record.
   * @param recordId The ID of the record.
   * @return List of ContentDocument records.
   */
  public static List<ContentDocument> getDocumentsByRecord(Id recordId) {
    if (recordId == null) {
      return new List<ContentDocument>();
    }
    Set<Id> docIds = new Set<Id>();
    for (ContentDocumentLink link : getLinksByRecord(recordId)) {
      docIds.add(link.ContentDocumentId);
    }
    return docIds.isEmpty()
      ? new List<ContentDocument>()
      : [
          SELECT
            Id,
            Title,
            LatestPublishedVersionId,
            FileType,
            ContentSize,
            CreatedDate
          FROM ContentDocument
          WHERE Id IN :docIds
          WITH SYSTEM_MODE
        ];
  }

  /**
   * @description Gets all ContentDocumentLinks for a specific document.
   * @param documentId The ID of the ContentDocument.
   * @return List of ContentDocumentLink records.
   */
  public static List<ContentDocumentLink> getLinksByDocument(Id documentId) {
    if (documentId == null) {
      return new List<ContentDocumentLink>();
    }
    return [
      SELECT Id, ContentDocumentId, LinkedEntityId, ShareType, Visibility
      FROM ContentDocumentLink
      WHERE ContentDocumentId = :documentId
      WITH SYSTEM_MODE
    ];
  }

  // --- 2. Linking ---

  /**
   * @description Links an existing ContentDocument to a record.
   * @param documentId The ID of the ContentDocument.
   * @param recordId The ID of the record.
   */
  public static void linkFileToRecord(Id documentId, Id recordId) {
    if (documentId == null || recordId == null) {
      return;
    }

    ContentDocumentLink newLink = new ContentDocumentLink(
      ContentDocumentId = documentId,
      LinkedEntityId = recordId,
      ShareType = 'V',
      Visibility = 'AllUsers'
    );
    insert as system newLink;
  }

  // --- 3. Unlinking ---

  /**
   * @description Safely removes a file from a record by deleting only the specific record link.
   * @param documentId The ID of the ContentDocument.
   * @param recordId The ID of the record.
   */
  public static void unlinkFromRecord(Id documentId, Id recordId) {
    if (documentId != null && recordId != null) {
      delete as system [
        SELECT Id
        FROM ContentDocumentLink
        WHERE ContentDocumentId = :documentId AND LinkedEntityId = :recordId
        WITH SYSTEM_MODE
      ];
    }
  }

  /**
   * @description Danger! Deletes a link directly by its ID. Use carefully.
   * @param linkId The ID of the ContentDocumentLink.
   */
  public static void deleteLinkById(Id linkId) {
    if (linkId == null) {
      return;
    }
    List<ContentDocumentLink> links = [
      SELECT Id
      FROM ContentDocumentLink
      WHERE Id = :linkId
      WITH SYSTEM_MODE
    ];
    if (!links.isEmpty()) {
      delete as system links;
    }
  }

  // --- 4. File Lifecycle ---

  /**
   * @description Completely deletes a ContentDocument (removes it from all linked records).
   * @param documentId The ID of the ContentDocument to delete.
   */
  public static void deleteDocument(Id documentId) {
    if (documentId == null) {
      return;
    }
    List<ContentDocument> docs = [
      SELECT Id
      FROM ContentDocument
      WHERE Id = :documentId
      WITH SYSTEM_MODE
    ];
    if (!docs.isEmpty()) {
      delete as system docs;
    }
  }

  /**
   * @description Deletes a document only if it has been orphaned (only linked to its owner/user).
   * @param documentId The ID of the ContentDocument to delete.
   */
  public static void deleteIfOrphan(Id documentId) {
    if (documentId != null && isOnlyLinkedToUser(documentId)) {
      deleteDocument(documentId);
    }
  }

  // --- 5. Upload / Create ---

  /**
   * @description Creates a new file from a blob and optionally links it to a record.
   * @param fileName The title and path of the file.
   * @param body The binary data of the file.
   * @param recordId The optional record ID to link the initial publish location to.
   * @return Id of the newly created ContentDocument.
   */
  public static Id createFile(String fileName, Blob body, Id recordId) {
    ContentVersion cv = new ContentVersion(
      Title = fileName,
      PathOnClient = fileName,
      VersionData = body,
      FirstPublishLocationId = recordId
    );
    insert as system cv;

    return [
      SELECT ContentDocumentId
      FROM ContentVersion
      WHERE Id = :cv.Id
      WITH SYSTEM_MODE
    ]
    .ContentDocumentId;
  }

  // --- 6. Security & Helpers ---

  /**
   * @description Checks if a specific link is a user link.
   * @param link The ContentDocumentLink to check.
   * @return True if the linked entity is a User.
   */
  public static Boolean isUserLink(ContentDocumentLink link) {
    if (link == null || link.LinkedEntityId == null) {
      return false;
    }
    return link.LinkedEntityId.getSObjectType() == User.SObjectType;
  }

  /**
   * @description Filters out User links to ensure we do not delete them.
   * @param links The list of links to filter.
   * @return List of ContentDocumentLink excluding User links.
   */
  public static List<ContentDocumentLink> filterDeletable(
    List<ContentDocumentLink> links
  ) {
    List<ContentDocumentLink> result = new List<ContentDocumentLink>();
    if (links != null) {
      for (ContentDocumentLink link : links) {
        if (!isUserLink(link)) {
          result.add(link);
        }
      }
    }
    return result;
  }

  /**
   * @description Checks if a document is linked to a specific record.
   * @param documentId The ID of the document.
   * @param recordId The ID of the record.
   * @return True if linked.
   */
  public static Boolean isLinkedToRecord(Id documentId, Id recordId) {
    if (documentId == null || recordId == null) {
      return false;
    }
    Integer count = [
      SELECT COUNT()
      FROM ContentDocumentLink
      WHERE ContentDocumentId = :documentId AND LinkedEntityId = :recordId
      WITH SYSTEM_MODE
    ];
    return count > 0;
  }

  /**
   * @description Returns the total number of links for a document.
   * @param documentId The ID of the document.
   * @return Integer representing the count of links.
   */
  public static Integer countLinks(Id documentId) {
    if (documentId == null) {
      return 0;
    }
    return [
      SELECT COUNT()
      FROM ContentDocumentLink
      WHERE ContentDocumentId = :documentId
      WITH SYSTEM_MODE
    ];
  }

  /**
   * @description Checks if a document is ONLY linked to users (meaning no business records reference it).
   * @param documentId The ID of the document.
   * @return True if only linked to users.
   */
  public static Boolean isOnlyLinkedToUser(Id documentId) {
    if (documentId == null) {
      return false;
    }

    for (ContentDocumentLink link : getLinksByDocument(documentId)) {
      if (!isUserLink(link)) {
        return false;
      }
    }
    return true;
  }

  /**
   * @description Retrieves the latest ContentVersions for a set of documents.
   * @param documentIds Set of ContentDocument Ids.
   * @return List of latest ContentVersions.
   */
  public static List<ContentVersion> getLatestVersions(Set<Id> documentIds) {
    if (documentIds == null || documentIds.isEmpty()) {
      return new List<ContentVersion>();
    }

    return [
      SELECT Id, Title, FileType, ContentDocumentId, VersionData, ContentSize
      FROM ContentVersion
      WHERE ContentDocumentId IN :documentIds AND IsLatest = TRUE
      WITH SYSTEM_MODE
    ];
  }
}
