@isTest
private class lookupControllerTest {
  @isTest
  static void testMethodLookupController() {
    LookupController.LookupInput lookupInputs = new LookupController.LookupInput();
    lookupInputs.selectedIds = new List<String>{ 'id' };
    lookupInputs.apexClass = 'LookupController.TestClass';
    lookupInputs.payload = '';

    Test.startTest();
    List<LookupResult> lookupResultSelection = LookupController.getSelection(
      lookupInputs
    );
    List<LookupResult> lookupResultDefault = LookupController.getDefault(
      lookupInputs
    );
    List<LookupResult> lookupResultMatching = LookupController.getMatching(
      lookupInputs
    );
    Test.stopTest();

    Assert.isNotNull(lookupResultSelection);
    Assert.isNotNull(lookupResultDefault);
    Assert.isNotNull(lookupResultMatching);
  }
}
