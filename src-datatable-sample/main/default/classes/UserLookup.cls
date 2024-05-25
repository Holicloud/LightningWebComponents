public with sharing class UserLookup implements LookupResult.ILookupResult {
  public final static Map<String, Object> USER_ICON = new Map<String, Object>{
    'iconName' => 'standard:user'
  };

  public List<LookupResult> getSelection(List<String> selectedIds, Map<String, Object> payload) {
    List<LookupResult> result = new List<LookupResult>();

    List<User> users = [
      SELECT Name, Profile.Name
      FROM User
      WHERE Id IN :selectedIds
      LIMIT 1
    ];

    return buildResults(users);
  }

  public List<LookupResult> getDefaultSearchResults(Map<String, Object> payload) {
    List<LookupResult> result = new List<LookupResult>();

    List<User> users = [
      SELECT Name, Profile.Name
      FROM User
      LIMIT 10
    ];

    return buildResults(users);
  }

  public List<LookupResult> getSearchResults(
    String searchTerm,
    List<String> selectedIds,
    Map<String, Object> payload
  ) {
    List<LookupResult> result = new List<LookupResult>();

    searchTerm = '%' + searchTerm + '%';

    List<User> users = [
      SELECT Name, Profile.Name
      FROM User
      WHERE Id NOT IN :selectedIds AND (Name LIKE :searchTerm OR Profile.Name LIKE :searchTerm)
      LIMIT 10
    ];

    return buildResults(users);
  }

  private List<LookupResult> buildResults(List<User> users) {
    List<LookupResult> result = new List<LookupResult>();

    for (User singleUser : users) {
      LookupResult singleResult = new LookupResult();
      singleResult.id = singleUser.Id;
      singleResult.icon = USER_ICON;
      singleResult.title = singleUser.Name;
      List<LookupResult.Subtitle> subtitles = new List<LookupResult.Subtitle>();

      if (String.isNotBlank(singleUser.Profile.Name)) {
        LookupResult.Subtitle email = new LookupResult.Subtitle();
        email.label = 'Profile Name';
        email.value = singleUser.Profile.Name;
        subtitles.add(email);
      }

      singleResult.subtitles = subtitles;
      result.add(singleResult);
    }

    return result;
  }
}
