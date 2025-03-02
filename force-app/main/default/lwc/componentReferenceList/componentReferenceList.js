import { COMPONENTS } from "c/componentReference";
import { LightningElement, track } from "lwc";
import { MessageChannelMixin } from "c/messageChannelMixin";
import componentReferenceChannel from "@salesforce/messageChannel/ComponentReference__c";
import { clone } from "c/utils";
const SECTIONS = Object.freeze(
  Object.values(COMPONENTS).reduce((acc, component) => {
    const group =
      acc.find((g) => g.label === component.type) ||
      acc[acc.push({ label: component.type, items: [] }) - 1];
    group.items.push({
      label: component.descriptor,
      name: component.descriptor
    });
    return acc;
  }, [])
);
const MIN_LENGTH = 2;

export default class ComponentReferenceList extends MessageChannelMixin(
  LightningElement
) {
  @track navigationData = SECTIONS;
  initiallySelected = SECTIONS[0].items[0].name;

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

    if (value?.length > MIN_LENGTH) {
      this.navigationData = clone(SECTIONS).filter((section) => {
        const filteredComponents = section.items.filter((component) =>
          component.label.toLowerCase().includes(value.toLowerCase())
        );

        if (filteredComponents.length) {
          section.items = filteredComponents;
          return true;
        }

        return false;
      });
    } else {
      this.navigationData = SECTIONS;
    }
  }
}
