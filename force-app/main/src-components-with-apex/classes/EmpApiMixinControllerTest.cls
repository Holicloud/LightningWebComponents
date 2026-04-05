@IsTest
private class EmpApiMixinControllerTest {
  @IsTest
  static void testPublishSuccess() {
    System.runAs(new User(Id = UserInfo.getUserId())) {
      Test.startTest();
      // Use the custom platform event we just created
      Map<String, Object> payload = new Map<String, Object>{
        'Message__c' => 'Test Error Message'
      };
      try {
        EmpApiMixinController.publishEvent('MyPlatformEvent__e', payload);
        Assert.isTrue(true, 'Should publish successfully without exception');
      } catch (Exception e) {
        Assert.fail(
          'Should not throw exception when publishing legitimate event. Threw: ' +
          e.getMessage()
        );
      }
      Test.stopTest();
    }
  }

  @IsTest
  static void testPublishInvalidEvent() {
    System.runAs(new User(Id = UserInfo.getUserId())) {
      Test.startTest();
      try {
        EmpApiMixinController.publishEvent(
          'NonExistentEvent__e',
          new Map<String, Object>()
        );
        Assert.fail('Should throw exception for non-existent event');
      } catch (AuraHandledException e) {
        Assert.isNotNull(e, 'Exception should be thrown');
      }
      Test.stopTest();
    }
  }

  @IsTest
  static void testPublishBlankEvent() {
    System.runAs(new User(Id = UserInfo.getUserId())) {
      Test.startTest();
      try {
        EmpApiMixinController.publishEvent('', new Map<String, Object>());
        Assert.fail('Should throw exception for blank event');
      } catch (AuraHandledException e) {
        Assert.isNotNull(e, 'Exception should be thrown');
      }
      Test.stopTest();
    }
  }
}
