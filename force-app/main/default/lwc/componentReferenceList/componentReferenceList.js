import { COMPONENTS, MIXINCOMPONENTS, COMPONENT_TYPES } from "c/componentReference";
import { LightningElement } from "lwc";
import { MessageChannelMixin } from "c/messageChannelMixin";
import componentReference from "@salesforce/messageChannel/ComponentReference__c";
const sections = [
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
  },
];

export default class ComponentReferenceList extends MessageChannelMixin(LightningElement) {
  navigationData = sections;
  initiallySelected = sections[0].items[0].name;

  handleSelect(event) {
    this[MessageChannelMixin.Publish](componentReference, {
      descriptor: event.detail.name
    });
  }
}
