/**
 * @class GetUsers
 * @description Provides methods to retrieve active User records.
 */
public with sharing class GetUsers {
  /**
   * @description Retrieves a list of up to 10 active users with their Id, Name, and Email.
   * @return List<User> List of active User records.
   */
  @AuraEnabled(cacheable=true)
  public static List<User> getActiveUsers() {
    return [
      SELECT Id, Name, Email, Profile.Name
      FROM User
      WHERE IsActive = TRUE
      WITH SYSTEM_MODE
      LIMIT 10
    ];
  }
}
