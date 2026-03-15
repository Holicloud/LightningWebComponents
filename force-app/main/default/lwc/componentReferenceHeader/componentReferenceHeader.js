import getComponents from "@salesforce/apex/ComponentReferenceController.getComponents";
import messageChannel from "@salesforce/messageChannel/ComponentReferenceChannel__c";
import { reduceErrors } from "c/ldsUtils";
import { MessageChannelMixin } from "c/messageChannelMixin";
import { Mixer } from "c/utils";
import { NavigationMixin } from "lightning/navigation";
import { wire } from "lwc";

const BASE_PATH =
  "https://github.com/santiagoparradev/LWC-RECIPES-SANTIAGO/tree/main/force-app/main/";
const GIT_PATH_BY_TYPE = {
  "Apex Reliant": "src-components-with-apex/lwc/"
};

export default class ComponentReferenceHeader extends new Mixer().mix(
  MessageChannelMixin,
  NavigationMixin
) {
  components;

  description;
  descriptor;
  error;

  git;
  targets = [];
  title;

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

  handleMessage = (message) => {
    const selected = this.components.find(
      (component) => component.DeveloperName === message.descriptor
    );
    this.setHeaderInformation(selected);
  };

  handleViewInGit() {
    this[NavigationMixin.Navigate]({
      type: "standard__webPage",
      attributes: {
        url: this.git
      }
    });
  }

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
}
