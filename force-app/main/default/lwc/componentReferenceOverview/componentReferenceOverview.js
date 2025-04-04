import { COMPONENTS, EXAMPLES } from "c/componentReference";
import componentReference from "@salesforce/messageChannel/ComponentReference__c";
import { MessageChannelMixin } from "c/messageChannelMixin";
import { Mixer } from "c/utils";
import { NavigationMixin } from "lightning/navigation";

export default class ComponentReferenceOverview extends new Mixer().mix(
  MessageChannelMixin,
  NavigationMixin
) {
  selectedExample;
  componentConstructor;
  examples = [];
  isLoading = true;

  get hasExamples() {
    return this.examples?.length;
  }

  handleChangeComponent = async (message) => {
    this.isLoading = true;
    this.examples = EXAMPLES[message.descriptor];
    this.setSelectedExample();
  };

  connectedCallback() {
    this[MessageChannelMixin.Subscribe]({
      listener: this.handleChangeComponent,
      channel: componentReference
    });

    const descriptor = Object.values(COMPONENTS)[0].descriptor;
    this.examples = EXAMPLES[descriptor];
    this.setSelectedExample();
  }

  async setSelectedExample(selectedIndex) {
    this.selectedExample = selectedIndex
      ? this.examples[selectedIndex]
      : this.examples[0];
    const { default: ctor } = await this.selectedExample.constructor();
    this.componentConstructor = ctor;
    this.isLoading = false;
  }

  get exampleOptions() {
    return this.examples?.map((example) => ({
      label: example.title,
      value: example.title
    }));
  }

  handleChangeExample(event) {
    this.setSelectedExample(
      this.examples.findIndex((example) => example.title === event.detail.value)
    );
  }

  handleViewInGit() {
    this[NavigationMixin.Navigate]({
      type: "standard__webPage",
      attributes: {
        url: this.selectedExample.git
      }
    });
  }
}
