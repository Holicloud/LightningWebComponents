/**
 * @description Controller responsible for explicitly publishing Platform Events via Apex
 * instead of the uiRecordApi payload format (which natively rejects some custom platform events).
 */
public with sharing class EmpApiMixinController {
  /**
   * @description Publishes a platform event using the EventBus.
   * @param eventName The API name of the target platform event (e.g. MyPlatformEvent__e).
   * @param payload Map of fields and their corresponding values to inject into the Platform Event.
   */
  @AuraEnabled
  public static void publishEvent(
    String eventName,
    Map<String, Object> payload
  ) {
    if (String.isBlank(eventName)) {
      throw new AuraHandledException('Event name cannot be blank.');
    }

    SObjectType eventType = Schema.getGlobalDescribe().get(eventName);
    if (eventType == null) {
      throw new AuraHandledException('Invalid event name: ' + eventName);
    }

    SObject eventObj = eventType.newSObject();
    if (payload != null) {
      for (String fieldName : payload.keySet()) {
        eventObj.put(fieldName, payload.get(fieldName));
      }
    }

    Database.SaveResult sr = EventBus.publish(eventObj);
    if (!sr.isSuccess()) {
      throw new AuraHandledException(
        'Error publishing event: ' + sr.getErrors()[0].getMessage()
      );
    }
  }
}
