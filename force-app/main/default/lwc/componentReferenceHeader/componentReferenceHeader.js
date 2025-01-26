import { LightningElement } from "lwc";
import { HEADER_INFO, COMPONENTS } from "c/componentReference";
import componentReference from "@salesforce/messageChannel/ComponentReference__c";
import { MessageChannelMixin } from "c/messageChannelMixin";
import { NavigationMixin } from "lightning/navigation";
import { applyMixings } from "c/utils";

export const BASE_INFO = HEADER_INFO[Object.values(COMPONENTS)[0].descriptor];

export default class ComponentReferenceHeader extends applyMixings(
  LightningElement,
  MessageChannelMixin,
  NavigationMixin
) {
  title;
  description;
  descriptor;
  targets = [];
  git;

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
      this.git = headerInformation.git;
    } else {
      this.title = null;
      this.description = null;
      this.descriptor = null;
      this.targets = null;
      this.git = null;
    }
  }

  connectedCallback() {
    this[MessageChannelMixin.Subscribe]({
      listener: this.handleMessage,
      channel: componentReference
    });
    this.setHeaderInformation(BASE_INFO);
  }

  handleViewInGit() {
    this[NavigationMixin.Navigate]({
      type: "standard__webPage",
      attributes: {
        url: this.git
      }
    });
  }
}
