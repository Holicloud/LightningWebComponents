import { LightningElement } from "lwc";
import { COMPONENTS, EXAMPLES } from "c/componentReference";
import componentReference from "@salesforce/messageChannel/ComponentReference__c";
import { MessageChannelMixin } from "c/messageChannelMixin";

export default class ComponentReferenceOverview extends MessageChannelMixin(
  LightningElement
) {
  viewCode = false;
  selectedExample;
  componentConstructor;
  examples = [];
  activeTab = "Example";
  documentation;

  get hasExamples() {
    return this.examples?.length;
  }

  handleChangeComponent = async (message) => {
    this.examples = EXAMPLES[message.descriptor].examples;
    this.documentation = EXAMPLES[message.descriptor].documentation;
    this.viewCode = false;

    if (!this.examples?.length) {
      this.activeTab = "Documentation";
      return;
    }

    this.setSelectedExample();
  };

  connectedCallback() {
    this[MessageChannelMixin.Subscribe]({
      listener: this.handleChangeComponent,
      channel: componentReference
    });

    const descriptor = Object.values(COMPONENTS)[0].descriptor;
    this.examples = EXAMPLES[descriptor].examples;
    this.documentation = EXAMPLES[descriptor].documentation;

    if (!this.examples?.length) {
      this.activeTab = "Documentation";
      return;
    }

    this.setSelectedExample();
  }

  async setSelectedExample(selectedIndex) {
    this.selectedExample = selectedIndex
      ? this.examples[selectedIndex]
      : this.examples[0];
    const { default: ctor } = await this.selectedExample.constructor();
    this.componentConstructor = ctor;
    this.activeTab = "Example";
  }

  get exampleOptions() {
    return this.examples.map((example) => ({
      label: example.title,
      value: example.title
    }));
  }

  handleChangeExample(event) {
    this.setSelectedExample(
      this.examples.findIndex((example) => example.title === event.detail.value)
    );
  }

  handleViewCode() {
    this.viewCode = !this.viewCode;
  }
}
