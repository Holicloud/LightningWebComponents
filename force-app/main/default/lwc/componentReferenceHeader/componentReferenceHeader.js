import { LightningElement } from "lwc";
import { HEADER_INFO, COMPONENTS } from "c/componentReference";
import componentReference from "@salesforce/messageChannel/ComponentReference__c";
import { MessageChannelMixin } from 'c/messageChannelMixin';

export default class ComponentReferenceHeader extends MessageChannelMixin(LightningElement) {
  title;
  description;
  descriptor;
  targets = [];

  handleMessage = (message) => {
    const headerInformation = HEADER_INFO[message.descriptor];
    this.setHeaderInformation(headerInformation);
  };

  setHeaderInformation(headerInformation) {
    if (headerInformation) {
      this.title = headerInformation.title;
      this.description = headerInformation.description;
      this.descriptor = headerInformation.descriptor;
      this.targets = headerInformation.targets;
    } else {
      this.title = null;
      this.description = null;
      this.descriptor = null;
      this.targets = null;
    }
  }

  connectedCallback() {
    this[MessageChannelMixin.Subscribe](
      this.handleMessage,
      componentReference
    );
    this.setHeaderInformation(HEADER_INFO[Object.values(COMPONENTS)[0].descriptor]);
  }

  disconnectedCallback() {
    this[MessageChannelMixin.Unsubscribe]();
  }
}
