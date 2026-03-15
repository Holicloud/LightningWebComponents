import getComponents from "@salesforce/apex/ComponentReferenceController.getComponents";
import getExamples from "@salesforce/apex/ComponentReferenceController.getExamples";
import messageChannel from "@salesforce/messageChannel/ComponentReferenceChannel__c";
import { reduceErrors } from "c/ldsUtils";
import { MessageChannelMixin } from "c/messageChannelMixin";
import { Mixer } from "c/utils";
import { NavigationMixin } from "lightning/navigation";
import { wire } from "lwc";
const BASE_PATH =
  "https://github.com/santiagoparradev/LWC-RECIPES-SANTIAGO/tree/main/force-app-examples/main/";
const GIT_PATH_BY_TYPE = {
  "Apex Reliant": "examples-with-apex/lwc/"
};

export default class ComponentReferenceOverview extends new Mixer().mix(
  MessageChannelMixin,
  NavigationMixin
) {
  allExamples = [];
  componentConstructor;
  components;
  error;
  examples = [];
  isLoading = true;
  selectedComponent;

  selectedExample;

  @wire(getComponents)
  wiredData({ error, data }) {
    if (data) {
      this.components = data;
      this.selectedComponent = this.components[0];
      this.error = null;
      getExamples().then((examples) => {
        this.allExamples = examples;
        this.examples = this.allExamples.filter(
          (example) => example.Component__c === this.selectedComponent.Id
        );
        this.setSelectedExample();
      });
    } else if (error) {
      this.error = reduceErrors(error);
    }
  }

  get exampleOptions() {
    return this.examples?.map((example) => ({
      label: example.Title__c,
      value: example.DeveloperName
    }));
  }

  get hasExamples() {
    return this.examples?.length;
  }

  handleChangeComponent = async (message) => {
    if (this.components && this.allExamples) {
      this.isLoading = true;
      this.selectedComponent = this.components.find(
        (component) => component.DeveloperName === message.descriptor
      );
      this.examples = this.allExamples.filter(
        (example) => example.Component__c === this.selectedComponent.Id
      );
      this.setSelectedExample();
    }
  };

  handleChangeExample(event) {
    this.setSelectedExample(
      this.examples.findIndex(
        (example) => example.DeveloperName === event.detail.value
      )
    );
  }

  handleViewInGit() {
    this[NavigationMixin.Navigate]({
      type: "standard__webPage",
      attributes: {
        url:
          BASE_PATH +
          (GIT_PATH_BY_TYPE[this.selectedComponent.Type__c] || "default/lwc/") +
          this.selectedExample.DeveloperName
      }
    });
  }

  async setSelectedExample(selectedIndex) {
    this.selectedExample = selectedIndex
      ? this.examples[selectedIndex]
      : this.examples[0];
    const { default: ctor } = await import(
      "c/" + this.selectedExample.DeveloperName
    );
    this.componentConstructor = ctor;
    this.isLoading = false;
  }

  connectedCallback() {
    this[MessageChannelMixin.Subscribe]({
      listener: this.handleChangeComponent,
      channel: messageChannel
    });
  }
}
