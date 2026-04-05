import MY_EVENT_OBJECT from "@salesforce/schema/MyPlatformEvent__e";
import { EmpApiMixin } from "c/empApiMixin";
import { LightningElement } from "lwc";

export default class EmpApiMixinBasic extends EmpApiMixin(LightningElement) {
  channel = "/event/MyPlatformEvent__e";
  events = [];
  isSubscribed = false;

  get hasEvents() {
    return this.events.length > 0;
  }

  get isNotSubscribed() {
    return !this.isSubscribed;
  }

  get statusVariant() {
    return this.isSubscribed ? "success" : "error";
  }

  get subscriptionStatus() {
    return this.isSubscribed ? "Subscribed" : "Unsubscribed";
  }

  handleEvent(payload) {
    this.events = [JSON.stringify(payload, null, 2), ...this.events];
  }

  handlePublish() {
    const inputElement = this.template.querySelector("lightning-input");
    const messageValue = inputElement ? inputElement.value : "Test Message";

    this[EmpApiMixin.Publish]({
      channel: this.channel,
      fields: {
        Message__c: messageValue
      }
    })
      .then((result) => {
        console.log(MY_EVENT_OBJECT.objectApiName);
        console.log("Successfully published event: ", JSON.stringify(result));
      })
      .catch((error) => {
        console.error("Error publishing event: ", JSON.stringify(error));
      });
  }

  handleSubscribe() {
    this[EmpApiMixin.Subscribe]({
      channel: this.channel,
      listener: this.handleEvent.bind(this),
      replayId: -1
    }).then(() => {
      this.isSubscribed = true;
    });
  }

  handleUnsubscribe() {
    this[EmpApiMixin.Unsubscribe](this.channel);
    this.isSubscribed = false;
  }

  connectedCallback() {
    this[EmpApiMixin.IsEmpEnabled]().then((empEnabled) => {
      console.log(`EMP API enabled: ${empEnabled}`);
    });
    this[EmpApiMixin.OnError]((error) => {
      console.error("EMP API Error", error);
    });
    // Auto subscribe
    this.handleSubscribe();
  }
}
