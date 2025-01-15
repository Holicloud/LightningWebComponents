import { COMPONENTS, COMPONENT_TYPES } from "c/componentReference";
import { LightningElement, track } from "lwc";
import { MessageChannelMixin } from "c/messageChannelMixin";
import componentReferenceChannel from "@salesforce/messageChannel/ComponentReference__c";
const sections = Object.freeze([
  {
    label: "Based On SLDS",
    items: Object.values(COMPONENTS)
      .filter((component) => component.type === COMPONENT_TYPES.COMPONENT)
      .map((component) => ({
        label: component.label,
        name: component.descriptor
      }))
  },
  {
    label: "Mixin",
    items: Object.values(COMPONENTS)
      .filter((component) => component.type === COMPONENT_TYPES.MIXIN)
      .map((component) => ({
        label: component.label,
        name: component.descriptor
      }))
  }
]);

export default class ComponentReferenceList extends MessageChannelMixin(LightningElement) {
  @track navigationData = sections;
  initiallySelected = sections[0].items[0].name;

  handleSelect(event) {
    this[MessageChannelMixin.Publish]({
      channel: componentReferenceChannel,
      payload: {
        descriptor: event.detail.name
      }
    });
  }

  handleInputChange(event) {
    const value = event.detail.value;

    if (value?.length > 2) {
      this.navigationData = structuredClone(sections).filter((section) => {
        const filteredComponents = section.items.filter((component) => component.label.includes(event.detail.value));

        if (filteredComponents.length) {
          section.items = filteredComponents;
          return true;
        }

        return false;
      });
    } else {
      this.navigationData = sections;
    }
  }
}
