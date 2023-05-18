public with sharing class GenerateData {
  private static List<String> emails = new List<String>{
    'ipsen@sbcglobal.net',
    'garland@sbcglobal.net',
    'webinc@optonline.net',
    'nullchar@comcast.net',
    'brbarret@msn.com',
    'mdielmann@hotmail.com',
    'hager@live.com',
    'rnelson@aol.com',
    'tbusch@mac.com',
    'vertigo@icloud.com',
    'nicktrig@hotmail.com',
    'quinn@comcast.net'
  };

  private static List<String> urls = new List<String>{
    'http://www.sample.org/head',
    'http://sample.edu/',
    'http://sample.org/',
    'http://sample.info/?insect=fireman&porter=attraction#cave',
    'http://sample.org/#yak',
    'https://sample.edu/railway',
    'https://sample.edu/day',
    'https://sample.info/#corn',
    'https://sample.org/cover',
    'https://sample.net/#hose'
  };

  private static final String chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz, .;';

  private static List<String> picklistValues = new List<String>{
    'a',
    'b',
    'c',
    'd',
    'e'
  };

  public static void doWork(Integer numberOfRecords) {
    List<DataTest__c> result = new List<DataTest__c>();
    List<String> accIds = getAccountIds();

    Integer size = picklistValues.size() + 1;

    for (Integer i = 0; i < numberOfRecords; i++) {
      DataTest__c singleResult = new DataTest__c();

      // singleResult.Checkbox__c = Math.mod(Integer.valueof((math.random() * 10)), 2) == 0;
      singleResult.Currency__c = Integer.valueOf(Math.random() * 999);
      singleResult.Date__c = randomDate(
        Date.newInstance(2000, 1, 1),
        Date.newInstance(2025, 1, 1)
      );
      singleResult.Time__c = randomTime(
        Integer.valueOf(Math.random() * 100000),
        Integer.valueOf(Math.random() * 100000)
      );
      singleResult.DateTime__c = DateTime.newInstance(
        singleResult.Date__c.year(),
        singleResult.Date__c.month(),
        singleResult.Date__c.day(),
        singleResult.Time__c.hour(),
        singleResult.Time__c.minute(),
        singleResult.Time__c.second()
      );

      singleResult.Email__c = getRandomElementFromList(emails);
      singleResult.Lookup__c = getRandomElementFromList(accIds);
      singleResult.Name = generateRandomString(
        12 + Integer.valueOf(Math.random() * 5)
      );
      // singleResult.MultiSelectPicklist__c = 'a;b;c;d;e';
      singleResult.Number__c = Integer.valueOf(Math.random() * 1000);
      singleResult.Percent__c = Integer.valueOf(Math.random() * 100);
      singleResult.Phone__c = String.valueOf(
        Integer.valueOf(Math.random() * 100000)
      );
      // singleResult.Picklist__c = getRandomElementFromList(picklistValues);
      // singleResult.Text__c = generateRandomString(12 + Integer.valueOf(Math.random() * 5));
      singleResult.TextArea__c = generateRandomString(
        50 + Integer.valueOf(Math.random() * 10)
      );
      singleResult.Url__c = getRandomElementFromList(urls);

      result.add(singleResult);
    }

    insert result;
  }

  public static Date randomDate(Date minDate, Date maxDate) {
    Integer rangeSize = minDate.daysBetween(maxDate) + 1;
    Decimal daysToAdd = rangeSize * math.Random();
    Date result = minDate.addDays(daysToAdd.intValue());
    return result;
  }

  public static Time randomTime(
    Integer randomNumber,
    Integer anotherRandomNumber
  ) {
    return Time.newInstance(randomNumber, anotherRandomNumber, 0, 0);
  }

  public static String getRandomElementFromList(List<String> values) {
    Integer listSize = values.size() - 1;
    Integer randomNumber = Integer.valueof((Math.random() * listSize));
    return values[randomNumber];
  }

  public static List<String> getAccountIds() {
    List<String> result = new List<String>();

    for (Account acc : [SELECT Id FROM Account]) {
      result.add(acc.Id);
    }

    return result;
  }

  public static String generateRandomString(Integer lengthOfString) {
    String randStr = '';
    while (randStr.length() < lengthOfString) {
      Integer idx = Math.mod(
        Math.abs(Crypto.getRandomInteger()),
        chars.length()
      );
      randStr += chars.substring(idx, idx + 1);
    }
    return randStr;
  }
}
