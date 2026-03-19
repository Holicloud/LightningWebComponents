/**
 * @class PermissionSetService
 * @description Provides methods to assign Permission Sets and Permission Set Groups to users.
 */
@SuppressWarnings('PMD.CognitiveComplexity, PMD.ExcessiveParameterList')
public with sharing class PermissionSetService {
  /**
   * @description Assigns a single Permission Set to a user.
   * @param assigneeId The User Id.
   * @param permissionSetName The Permission Set name.
   */
  public static void assignPermissionSets(
    Id assigneeId,
    String permissionSetName
  ) {
    assignPermissionSets(assigneeId, new Set<String>{ permissionSetName });
  }

  /**
   * @description Assigns multiple Permission Sets to a single user.
   * @param assigneeId The User Id.
   * @param permissionSetNames A set of Permission Set names.
   */
  public static void assignPermissionSets(
    Id assigneeId,
    Set<String> permissionSetNames
  ) {
    assignPermissionSets(
      new Map<Id, Set<String>>{ assigneeId => permissionSetNames }
    );
  }

  /**
   * @description Assigns a single Permission Set Group to a user.
   * @param assigneeId The User Id.
   * @param groupName The Permission Set Group name.
   */
  public static void assignPermissionSetGroups(
    Id assigneeId,
    String groupName
  ) {
    assignPermissionSetGroups(assigneeId, new Set<String>{ groupName });
  }

  /**
   * @description Assigns multiple Permission Set Groups to a single user.
   * @param assigneeId The User Id.
   * @param groupNames A set of Permission Set Group names.
   */
  public static void assignPermissionSetGroups(
    Id assigneeId,
    Set<String> groupNames
  ) {
    assignPermissionSetGroups(
      new Map<Id, Set<String>>{ assigneeId => groupNames }
    );
  }

  /**
   * @description Assigns Permission Sets to users based on the provided map.
   * @param permissionSetNamesByAssigneeId A map where keys are User Ids and values are sets of Permission Set names.
   */
  public static void assignPermissionSets(
    Map<Id, Set<String>> permissionSetNamesByAssigneeId
  ) {
    if (isEmpty(permissionSetNamesByAssigneeId)) {
      return;
    }

    Set<String> allPermissionSetNames = collectNames(
      permissionSetNamesByAssigneeId
    );
    Map<String, Id> psIdByName = getPermissionSetIdMap(allPermissionSetNames);
    if (psIdByName.isEmpty()) {
      return;
    }

    Set<String> existingKeys = getExistingAssignments(
      permissionSetNamesByAssigneeId.keySet(),
      new Set<Id>(psIdByName.values()),
      false
    );

    List<PermissionSetAssignment> assignmentsToInsert = buildAssignments(
      permissionSetNamesByAssigneeId,
      psIdByName,
      existingKeys,
      false
    );

    if (!assignmentsToInsert.isEmpty()) {
      insert as system assignmentsToInsert;
    }
  }

  /**
   * @description Assigns Permission Set Groups to users based on the provided map.
   * @param permissionSetGroupNamesByAssigneeId A map where keys are User Ids and values are sets of Permission Set Group names.
   */
  public static void assignPermissionSetGroups(
    Map<Id, Set<String>> permissionSetGroupNamesByAssigneeId
  ) {
    if (isEmpty(permissionSetGroupNamesByAssigneeId)) {
      return;
    }

    Set<String> allGroupNames = collectNames(
      permissionSetGroupNamesByAssigneeId
    );
    Map<String, Id> groupIdByName = getPermissionSetGroupIdMap(allGroupNames);
    if (groupIdByName.isEmpty()) {
      return;
    }

    Set<String> existingKeys = getExistingAssignments(
      permissionSetGroupNamesByAssigneeId.keySet(),
      new Set<Id>(groupIdByName.values()),
      true
    );

    List<PermissionSetAssignment> assignmentsToInsert = buildAssignments(
      permissionSetGroupNamesByAssigneeId,
      groupIdByName,
      existingKeys,
      true
    );

    if (!assignmentsToInsert.isEmpty()) {
      insert as system assignmentsToInsert;
    }
  }

  private static Boolean isEmpty(Map<Id, Set<String>> m) {
    return m == null || m.isEmpty();
  }

  private static Set<String> collectNames(Map<Id, Set<String>> m) {
    Set<String> allNames = new Set<String>();
    for (Set<String> names : m.values()) {
      if (names != null) {
        allNames.addAll(names);
      }
    }
    return allNames;
  }

  private static Map<String, Id> getPermissionSetIdMap(Set<String> names) {
    Map<String, Id> psIdByName = new Map<String, Id>();
    for (PermissionSet ps : [
      SELECT Id, Name
      FROM PermissionSet
      WHERE Name IN :names
      WITH SYSTEM_MODE
    ]) {
      psIdByName.put(ps.Name, ps.Id);
    }
    return psIdByName;
  }

  private static Map<String, Id> getPermissionSetGroupIdMap(Set<String> names) {
    Map<String, Id> psgIdByName = new Map<String, Id>();
    for (PermissionSetGroup psg : [
      SELECT Id, DeveloperName
      FROM PermissionSetGroup
      WHERE DeveloperName IN :names
      WITH SYSTEM_MODE
    ]) {
      psgIdByName.put(psg.DeveloperName, psg.Id);
    }
    return psgIdByName;
  }

  private static Set<String> getExistingAssignments(
    Set<Id> userIds,
    Set<Id> targetIds,
    Boolean isGroup
  ) {
    Set<String> keys = new Set<String>();
    if (isGroup) {
      for (PermissionSetAssignment psa : [
        SELECT AssigneeId, PermissionSetGroupId
        FROM PermissionSetAssignment
        WHERE AssigneeId IN :userIds AND PermissionSetGroupId IN :targetIds
        WITH SYSTEM_MODE
      ]) {
        keys.add(psa.AssigneeId + '|' + psa.PermissionSetGroupId);
      }
    } else {
      for (PermissionSetAssignment psa : [
        SELECT AssigneeId, PermissionSetId
        FROM PermissionSetAssignment
        WHERE AssigneeId IN :userIds AND PermissionSetId IN :targetIds
        WITH SYSTEM_MODE
      ]) {
        keys.add(psa.AssigneeId + '|' + psa.PermissionSetId);
      }
    }
    return keys;
  }

  private static List<PermissionSetAssignment> buildAssignments(
    Map<Id, Set<String>> requested,
    Map<String, Id> idByName,
    Set<String> existingKeys,
    Boolean isGroup
  ) {
    List<PermissionSetAssignment> toInsert = new List<PermissionSetAssignment>();
    for (Id userId : requested.keySet()) {
      Set<String> names = requested.get(userId);
      if (names == null) {
        continue;
      }
      for (String name : names) {
        Id targetId = idByName.get(name);
        if (targetId == null) {
          continue;
        }
        String key = userId + '|' + targetId;
        if (!existingKeys.contains(key)) {
          toInsert.add(createAssignment(userId, targetId, isGroup));
          existingKeys.add(key);
        }
      }
    }
    return toInsert;
  }

  private static PermissionSetAssignment createAssignment(
    Id userId,
    Id targetId,
    Boolean isGroup
  ) {
    if (isGroup) {
      return new PermissionSetAssignment(
        AssigneeId = userId,
        PermissionSetGroupId = targetId
      );
    }
    return new PermissionSetAssignment(
      AssigneeId = userId,
      PermissionSetId = targetId
    );
  }
}
