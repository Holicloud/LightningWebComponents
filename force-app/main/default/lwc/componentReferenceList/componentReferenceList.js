import { LightningElement, track } from "lwc";
import { MessageChannelMixin } from "c/messageChannelMixin";
import messageChannel from "@salesforce/messageChannel/ComponentReferenceChannel__c";
import { clone } from "c/utils";
import getComponents from "@salesforce/apex/ComponentReferenceController.getComponents";
import { wire } from "lwc";
import { reduceErrors } from "c/ldsUtils";
const MIN_LENGTH = 2;

export default class ComponentReferenceList extends MessageChannelMixin(
  LightningElement
) {
  @track navigationData = [];
  navigationDataStateful = [];
  initiallySelected = null;

  @wire(getComponents)
  wiredData({ error, data }) {
    if (data) {
      this.navigationData = Object.freeze(
        Object.values(data).reduce((acc, component) => {
          const group =
            acc.find((g) => g.label === component.Type__c) ||
            acc[acc.push({ label: component.Type__c, items: [] }) - 1];
          group.items.push({
            label: "c/" + component.DeveloperName,
            name: component.DeveloperName
          });
          return acc;
        }, [])
      );
      this.navigationDataStateful = this.navigationData;
      this.initiallySelected = data[0].DeveloperName;
      this.error = null;
    } else if (error) {
      this.error = reduceErrors(error);
    }
  }

  handleSelect(event) {
    this[MessageChannelMixin.Publish]({
      channel: messageChannel,
      payload: {
        descriptor: event.detail.name
      }
    });
  }

  handleInputChange(event) {
    const value = event.detail.value;

    if (value?.length > MIN_LENGTH) {
      this.navigationData = clone(this.navigationData).filter((section) => {
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
      this.navigationData = this.navigationDataStateful;
    }
  }
}
