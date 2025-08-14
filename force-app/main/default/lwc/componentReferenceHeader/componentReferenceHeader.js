import messageChannel from "@salesforce/messageChannel/ComponentReferenceChannel__c";
import { MessageChannelMixin } from "c/messageChannelMixin";
import { NavigationMixin } from "lightning/navigation";
import { Mixer } from "c/utils";
import getComponents from "@salesforce/apex/ComponentReferenceController.getComponents";
import { wire } from "lwc";
import { reduceErrors } from "c/ldsUtils";

const BASE_PATH =
  "https://github.com/santiagoparradev/LWC-RECIPES-SANTIAGO/tree/main/force-app/main/";
const GIT_PATH_BY_TYPE = {
  "Apex Reliant": "src-components-with-apex/lwc/"
};

export default class ComponentReferenceHeader extends new Mixer().mix(
  MessageChannelMixin,
  NavigationMixin
) {
  title;
  description;
  descriptor;
  targets = [];
  git;
  error;

  handleMessage = (message) => {
    const selected = this.components.find(
      (component) => component.DeveloperName === message.descriptor
    );
    this.setHeaderInformation(selected);
  };

  setHeaderInformation(component) {
    if (component) {
      this.title = component.Label;
      this.description = component.Description__c;
      this.descriptor = "c/" + component.DeveloperName;
      this.targets = component.Targets__c.split(",");
      this.git =
        BASE_PATH +
        (GIT_PATH_BY_TYPE[component.Type__c] || "src-components/lwc/") +
        component.DeveloperName;
    } else {
      this.title = null;
      this.description = null;
      this.descriptor = null;
      this.targets = null;
      this.git = null;
      this.error = null;
    }
  }

  connectedCallback() {
    this[MessageChannelMixin.Subscribe]({
      listener: this.handleMessage,
      channel: messageChannel
    });
  }

  components;

  @wire(getComponents)
  wiredData({ error, data }) {
    if (data) {
      this.components = data;
      this.setHeaderInformation(this.components[0]);
      this.error = null;
    } else if (error) {
      this.error = reduceErrors(error);
    }
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
