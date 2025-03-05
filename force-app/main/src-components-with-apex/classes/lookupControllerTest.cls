
@isTest
private class lookupControllerTest {

  @isTest
  static void myUnitTest() {
    
    Test.testStart();
    List<LookupResult> lookupResultSelection = LookupController.getSelection('TestClass', new List<String>{'id'}, '');
    List<LookupResult> lookupResultDefault = LookupController.getDefault('TestClass', '');
    List<LookupResult> lookupResultList = LookupController.getMatching(new LookupInput);
    Test.testStop();
    
    Assert.isNotNull(lookupResultList);
    Assert.isNotNull(lookupResultDefault);
  }
}


